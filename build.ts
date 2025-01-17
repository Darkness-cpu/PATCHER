import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { minify } from "luamin";
import { bundle } from "luabundle";
const entryPoint = path.join(__dirname, "src/index.lua");
const output = path.join(__dirname, "../dist", "Patcher.lua");
const bundleOptions = {
  paths: [`src${path.sep}?.lua`],
};
// Ensure the output directory exists
if (!fs.existsSync(path.dirname(output))) fs.mkdirSync(path.dirname(output));
// Function to get a formatted timestamp
const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleString(); // Example: "1/17/2025, 10:00:00 AM"
};
// Function to build the Lua file
const build = (): void => {
  console.log(`[${getTimestamp()}] Starting build...`);
  try {
    const bundledCode = bundle(entryPoint, bundleOptions);
    const minifiedCode = minify(bundledCode);
    fs.writeFileSync(output, minifiedCode);
    console.log(`[${getTimestamp()}] Build complete!`);
    console.log(`Output: ${output}`);
  } catch (error) {
    console.error(`[${getTimestamp()}] Build failed:`, (error as Error).message);
  }
};
// Check for the --watch or -w flag
const isWatchMode = process.argv.includes("--watch") || process.argv.includes("-w");
if (isWatchMode) {
  console.log(`[${getTimestamp()}] Watching for changes...`);
  // Initial build
  build();
  // Watch for changes in the src directory
  chokidar
    .watch(path.join(__dirname, "../src"), { persistent: true })
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
