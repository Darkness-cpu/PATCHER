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

// Function to build the Lua file
const build = () => {
  try {
    const bundledCode = bundle(entryPoint, bundleOptions);
    const minifiedCode = minify(bundledCode);

    fs.writeFileSync(output, minifiedCode);
    console.log("Build complete!");
    console.log(`Output: ${output}`);
  } catch (error) {
    console.error("Build failed:", error.message);
  }
};

// Initial build
build();

// Watch for changes in the src directory
chokidar
  .watch(path.join(__dirname, "src"), { persistent: true })
  .on("change", (filePath) => {
    console.log(`File changed: ${filePath}`);
    build();
  })
  .on("error", (error) => {
    console.error("Watcher error:", error);
  });

console.log("Watching for changes...");
