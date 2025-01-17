const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { minify } = require("luamin");
const { bundle } = require("luabundle");

const entryPoint = path.join(__dirname, "src", "index.lua");
const output = path.join(__dirname, "dist", "Patcher.lua");

const bundleOptions = {
  paths: [`src${path.sep}?.lua`],
};

// Ensure the output directory exists
if (!fs.existsSync(path.dirname(output))) fs.mkdirSync(path.dirname(output));

// Function to get a formatted timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleString(); // Example: "1/17/2025, 10:00:00 AM"
};

// Function to build the Lua file
const build = () => {
  console.log(`[${getTimestamp()}] Starting build...`);
  try {
    const bundledCode = bundle(entryPoint, bundleOptions);
    const minifiedCode = minify(bundledCode);

    fs.writeFileSync(output, minifiedCode);
    console.log(`[${getTimestamp()}] Build complete!`);
    console.log(`Output: ${output}`);
  } catch (error) {
    console.error(`[${getTimestamp()}] Build failed:`, error.message);
  }
};

// Check for the --watch flag
const isWatchMode = process.argv.includes("--watch");

if (isWatchMode) {
  console.log(`[${getTimestamp()}] Watching for changes...`);
  // Initial build
  build();

  // Watch for changes in the src directory
  chokidar
    .watch(path.join(__dirname, "src"), { persistent: true })
    .on("change", (filePath) => {
      console.log(`[${getTimestamp()}] File changed: ${filePath}`);
      build();
    })
    .on("error", (error) => {
      console.error(`[${getTimestamp()}] Watcher error:`, error);
    });
} else {
  // Run a single build
  build();
}
