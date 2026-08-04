import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = await mkdtemp(path.join(os.tmpdir(), "zgirl-activation-self-test-"));
const recordPath = path.join(root, "activation-record.json");
const bundlePath = path.join(root, "activation-bundle");

function run(script, args) {
  const result = spawnSync(process.execPath, [path.join(scriptsDir, script), ...args], {
    cwd: path.dirname(scriptsDir),
    encoding: "utf8",
    env: { ...process.env },
  });

  if (result.status !== 0) {
    throw new Error(
      `${script} failed with exit code ${result.status}.\n${result.stderr || result.stdout}`,
    );
  }
}

try {
  run("generate-review-credentials.mjs", ["--out", recordPath]);
  run("create-vercel-activation-bundle.mjs", [
    "--record",
    recordPath,
    "--gateway-url",
    "https://example-gateway.vercel.app",
    "--out",
    bundlePath,
  ]);

  for (const filename of [
    "activation-record.json",
    "private-gateway.env",
    "public-zgirl.env",
    "reviewer-credentials.csv",
    "apply-vercel-env.ps1",
    "verify-review-activation.ps1",
    "verify-review-activation.mjs",
    "README.txt",
    ".gitignore",
  ]) {
    await access(path.join(bundlePath, filename));
  }

  const publicEnvironment = await readFile(
    path.join(bundlePath, "public-zgirl.env"),
    "utf8",
  );
  if (
    !publicEnvironment.includes(
      "ZGIRL_REVIEW_ASSET_BASE_URL=https://example-gateway.vercel.app/api/review-assets",
    )
  ) {
    throw new Error("The generated public gateway URL is incorrect.");
  }

  const privateEnvironment = await readFile(
    path.join(bundlePath, "private-gateway.env"),
    "utf8",
  );
  if (!privateEnvironment.startsWith("ZGIRL_ASSET_GATEWAY_BEARER_TOKEN=")) {
    throw new Error("The generated private gateway environment file is invalid.");
  }

  console.log("Reviewer activation automation self-test passed without displaying secrets.");
} finally {
  await rm(root, { recursive: true, force: true });
}
