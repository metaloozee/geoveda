import { spawnSync } from "node:child_process";

const [taskName, ...forgeArgs] = process.argv.slice(2);

if (!taskName || forgeArgs.length === 0) {
  console.error(
    "Usage: bun ./scripts/forge-task.mjs <taskName> <forge-args...>"
  );
  process.exit(1);
}

const isCi = process.env.CI === "true";
const check = spawnSync("forge", ["--version"], {
  stdio: "ignore",
  shell: true,
});
const hasForge = check.status === 0;

if (!hasForge) {
  const message = `Skipping @geoveda/contracts ${taskName}: Foundry \`forge\` is not installed. Install from https://book.getfoundry.sh/getting-started/installation`;

  if (isCi) {
    console.error(`${message}. CI requires contracts checks.`);
    process.exit(1);
  }

  console.warn(message);
  process.exit(0);
}

const run = spawnSync("forge", forgeArgs, {
  stdio: "inherit",
  shell: true,
});

process.exit(run.status ?? 1);
