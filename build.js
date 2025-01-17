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

if (!fs.existsSync(path.dirname(output))) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
}

function build() {
  try {
    const bundledCode = bundle(entryPoint, bundleOptions);
    const minifiedCode = minify(bundledCode);
    fs.writeFileSync(output, minifiedCode);
    console.log(`[${new Date().toLocaleTimeString()}] Build complete!`);
    console.log(`Output: ${output}`);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Build failed:`, error.message);
  }
}

// Initial build
build();

// Watch for changes in the "src" directory
chokidar.watch(path.join(__dirname, "src"), { persistent: true }).on("all", (event, filePath) => {
  if (["add", "change", "unlink"].includes(event)) {
    console.log(`[${new Date().toLocaleTimeString()}] Detected ${event} in ${filePath}. Rebuilding...`);
    build();
  }
});
