/**
 * Guards the one coupling this repo cannot express in a single place.
 *
 * `engines.node` is the source of truth. The tsdown build target and the CI
 * Node version are both derived from it (see tsdown.config.ts and the
 * `node-version-file` inputs in .github/workflows), so they cannot drift.
 *
 * `@types/node` cannot be derived — it is a pinned dependency version — and a
 * mismatch fails silently: typings newer than `engines.node` let TypeScript
 * accept APIs that do not exist on the runtime the package claims to support.
 * That is what this checks.
 */
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const errors: Array<string> = [];

const enginesRange: string | undefined = pkg.engines?.node;
if (!enginesRange) {
  errors.push("engines.node is not set");
}

const enginesMajor = enginesRange ? /(\d+)/.exec(enginesRange)?.[1] : undefined;
if (enginesRange && !enginesMajor) {
  errors.push(`could not read a major version out of engines.node: ${enginesRange}`);
}

const typesRange: string | undefined = pkg.devDependencies?.["@types/node"];
if (!typesRange) {
  errors.push("@types/node is not in devDependencies");
}

const typesMajor = typesRange ? /(\d+)/.exec(typesRange)?.[1] : undefined;

if (enginesMajor && typesMajor && enginesMajor !== typesMajor) {
  const why =
    Number(typesMajor) > Number(enginesMajor)
      ? "Typings ahead of the floor let TypeScript accept APIs that do not exist at runtime."
      : "Typings behind the floor hide APIs the supported runtime actually has.";
  errors.push(
    `@types/node ${typesRange} types Node ${typesMajor}, but engines.node is "${enginesRange}" (Node ${enginesMajor}).\n` +
      `  ${why}\n` +
      `  Set @types/node to the ${enginesMajor}.x line, or change engines.node.`,
  );
}

if (errors.length > 0) {
  console.error("✗ engines check failed:\n");
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
}

console.log(`✓ engines.node "${enginesRange}" and @types/node ${typesRange} agree on Node ${enginesMajor}`);
