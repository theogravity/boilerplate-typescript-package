import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  platform: "node",
  // Target the runtime declared in engines.node, not an ES year: it is
  // more precise (an ES year still downlevels newer syntax) and stays
  // reproducible, unlike "esnext" which drifts with tool versions.
  target: "node26",
  sourcemap: false,
  nodeProtocol: true,
  fixedExtension: false,
  // Validate the published package shape on every build.
  publint: true,
  attw: true,
});
