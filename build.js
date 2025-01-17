const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const rimraf = require("rimraf");
const { minify } = require("luamin");
const { bundle } = require("luabundle");

const entryPoint = path.join(__dirname, "src", "index.lua");
const distDir = path.join(__dirname, "dist");
const output = path.join(distDir, "Patcher.lua");

const bundleOptions = {
  paths: [`src${path.sep}?.lua`],
};

// Function to get a formatted timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleString(); // Example: "1/17/2025, 10:00:00 AM"
};

// Function to clean the dist directory
const cleanDist = () => {
  console.log(`[${getTimestamp()}] Cleaning dist directory...`);
  rimraf.sync(distDir);
  console.log(`[${getTimestamp()}] Dist directory cleaned.`);
};

// Function to build the Lua file
const build = () => {
  console.log(`[${getTimestamp()}] Starting build...`);
  try {
    // Ensure the dist directory exists
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

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

// Clean and rebuild once
cleanDist();
build();

if (isWatchMode) {
  console.log(`[${getTimestamp()}] Watching for changes...`);

  // Watch for changes in the src directory
  chokidar
    .watch(path.join(__dirname, "src"), { persistent: true })
    .on("change", (filePath) => {
      console.log(`[${getTimestamp()}] File changed: ${filePath}`);
      cleanDist();
      build();
    })
    .on("error", (error) => {
      console.error(`[${getTimestamp()}] Watcher error:`, error);
    });
}
