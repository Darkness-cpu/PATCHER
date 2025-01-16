const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const chalk = require("chalk");
const notifier = require("node-notifier");
const { minify } = require("luamin");
const { bundle } = require("luabundle");

// Load configuration
let config = require("./config.json");

// Helper functions for logging
function logInfo(message) {
  console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] ${message}`));
}

function logSuccess(message) {
  console.log(chalk.green(`[${new Date().toLocaleTimeString()}] ${message}`));
}

function logError(message) {
  console.error(chalk.red(`[${new Date().toLocaleTimeString()}] ${message}`));
}

// Notify function
function notify(title, message) {
  notifier.notify({
    title,
    message,
    sound: true,
  });
}

// Clean output directory
function cleanOutput() {
  const outputDir = path.dirname(path.join(__dirname, config.output));
  if (fs.existsSync(outputDir)) {
    fs.readdirSync(outputDir).forEach((file) => {
      fs.unlinkSync(path.join(outputDir, file));
    });
    logInfo("Output directory cleaned.");
  }
}

// Get file size in KB
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2) + " KB";
}

// Build all Lua files
function buildAll() {
  const files = fs.readdirSync(path.join(__dirname, "src")).filter((file) => file.endsWith(".lua"));
  files.forEach((file) => {
    const input = path.join(__dirname, "src", file);
    const outputFile = path.join(__dirname, "dist", file);

    try {
      const bundledCode = bundle(input, config.bundleOptions);
      const result = config.isDev ? bundledCode : minify(bundledCode);
      fs.writeFileSync(outputFile, result);

      const fileSize = getFileSize(outputFile);
      logSuccess(`Build complete for: ${file} (Size: ${fileSize})`);
    } catch (error) {
      logError(`Failed to build ${file}: ${error.message}`);
      notify("Build Failed", error.message);
    }
  });
}

// Watch for changes in config and source files
function setupWatch() {
  chokidar.watch("./config.json").on("change", () => {
    delete require.cache[require.resolve("./config.json")];
    config = require("./config.json");
    logInfo("Reloaded configuration.");
  });

  chokidar.watch(path.join(__dirname, "src"), { persistent: true }).on("all", (event, filePath) => {
    if (["add", "change", "unlink"].includes(event)) {
      logInfo(`Detected ${event} in ${filePath}. Rebuilding...`);
      buildAll();
    }
  });
}

// Command-line arguments
const args = process.argv.slice(2);
const isWatch = args.includes("--watch");
const isClean = args.includes("--clean");

// Main execution
if (isClean) cleanOutput();
buildAll();
if (isWatch) setupWatch();
