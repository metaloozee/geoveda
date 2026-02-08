/**
 * Patches @convex-dev/better-auth to fix SIWE (walletAddress) support.
 *
 * Bug: The package's auth-options.js doesn't include the `siwe` plugin,
 * so the runtime `betterAuthSchema` (from `getAuthTables`) doesn't know
 * about the `walletAddress` model. This causes `adapter:findOne` to crash
 * with "Cannot read properties of undefined (reading 'fields')" when the
 * SIWE plugin tries to look up or create walletAddress records.
 *
 * Fix:
 * 1. Add `siwe` to the plugins list in auth-options.js
 * 2. Add a null check in adapter-utils.js for unknown models
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, "../node_modules/@convex-dev/better-auth");

const errors = [];

function patchFile(relPath, patches) {
  const filePath = resolve(pkgRoot, relPath);
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    const msg = `Failed to read ${relPath}: ${err.message}`;
    console.error(`  [error] ${msg}`);
    errors.push(msg);
    return;
  }

  let patched = false;

  for (const { find, replace, description } of patches) {
    if (content.includes(replace)) {
      console.log(`  [skip] ${description} (already applied)`);
      continue;
    }
    if (!content.includes(find)) {
      const msg = `${description} - pattern not found in ${relPath}. The upstream package may have changed; update this patch script.`;
      console.error(`  [FAIL] ${msg}`);
      errors.push(msg);
      continue;
    }
    content = content.replace(find, replace);
    patched = true;
    console.log(`  [done] ${description}`);
  }

  if (patched) {
    try {
      writeFileSync(filePath, content, "utf-8");
    } catch (err) {
      const msg = `Failed to write ${relPath}: ${err.message}`;
      console.error(`  [error] ${msg}`);
      errors.push(msg);
    }
  }
}

console.log("Patching @convex-dev/better-auth for SIWE support...");

// Patch 1: Add siwe import and plugin to auth-options.js
patchFile("dist/auth-options.js", [
  {
    find: 'import { anonymous, bearer, emailOTP, genericOAuth, jwt, magicLink, oidcProvider, oneTap, oneTimeToken, phoneNumber, twoFactor, username, } from "better-auth/plugins";',
    replace:
      'import { anonymous, bearer, emailOTP, genericOAuth, jwt, magicLink, oidcProvider, oneTap, oneTimeToken, phoneNumber, siwe, twoFactor, username, } from "better-auth/plugins";',
    description: "Add siwe import to auth-options.js",
  },
  {
    find: "        jwt(),\n        convex({",
    replace: '        jwt(),\n        siwe({ domain: "" }),\n        convex({',
    description: "Add siwe() plugin to auth-options.js",
  },
]);

// Patch 2: Add null check in adapter-utils.js for unknown models
patchFile("dist/client/adapter-utils.js", [
  {
    find: 'const isUniqueField = (betterAuthSchema, model, field) => {\n    const fields = betterAuthSchema[model]["fields"];',
    replace:
      'const isUniqueField = (betterAuthSchema, model, field) => {\n    const table = betterAuthSchema[model];\n    if (!table) {\n        return false;\n    }\n    const fields = table["fields"];',
    description: "Add null check for unknown models in isUniqueField",
  },
]);

if (errors.length > 0) {
  console.error(
    `\nPatching FAILED with ${errors.length} error(s). SIWE wallet auth will not work until these are resolved:\n`
  );
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
}

console.log("Patching complete.");
