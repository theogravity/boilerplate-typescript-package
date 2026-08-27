import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  platform: "node",
  target: "es2022",
  sourcemap: false,
  nodeProtocol: true,
  fixedExtension: false,
  // Validate the published package shape on every build.
  publint: true,
  attw: true,
});
