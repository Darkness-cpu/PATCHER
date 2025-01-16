const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const chalk = require("chalk");
const { minify } = require("luamin");
const { bundle } = require("luabundle");

const entryPoint = path.join(__dirname, "src", "index.lua");
const output = path.join(__dirname, "dist", "Patcher.lua");

const bundleOptions = {
  paths: [`src${path.sep}?.lua`],
};

if (!fs.existsSync(path.dirname(output))) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
}

function logInfo(message) {
  console.log(chalk.blue(`[${new Date().toLocaleTimeString()}] ${message}`));
}

function logSuccess(message) {
  console.log(chalk.green(`[${new Date().toLocaleTimeString()}] ${message}`));
}

function logError(message) {
  console.error(chalk.red(`[${new Date().toLocaleTimeString()}] ${message}`));
}

function build() {
  try {
    logInfo("Starting build...");
    const bundledCode = bundle(entryPoint, bundleOptions);
    const minifiedCode = minify(bundledCode);
    fs.writeFileSync(output, minifiedCode);
    logSuccess("Build complete!");
    logSuccess(`Output: ${output}`);
  } catch (error) {
    logError(`Build failed: ${error.message}`);
  }
}

// Initial build
build();

// Watch for changes in the "src" directory
chokidar.watch(path.join(__dirname, "src"), { persistent: true }).on("all", (event, filePath) => {
  if (["add", "change", "unlink"].includes(event)) {
    logInfo(`Detected ${event} in ${filePath}. Rebuilding...`);
    build();
  }
});
