import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function requireFile(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) errors.push(`Missing required file: ${relativePath}`);
}

function requireText(relativePath, patterns) {
  requireFile(relativePath);
  if (!fs.existsSync(path.join(root, relativePath))) return;
  const source = read(relativePath);
  for (const pattern of patterns) {
    if (!pattern.test(source)) errors.push(`${relativePath} is missing required guard/pattern: ${pattern}`);
  }
}

const pkg = readJson("package.json");
const manifestPath = "release/zgirl-v3.10-release-train.json";
const manifest = readJson(manifestPath);

if (pkg.version !== "3.10.0") errors.push(`package.json version must be 3.10.0; found ${pkg.version}`);
if (manifest.release !== pkg.version) errors.push(`Release manifest ${manifest.release} does not match package version ${pkg.version}`);
if (manifest.productionBaseline?.mainSha !== "f92fa742199d8fbc5719ec8562e781f1b63af6ff") {
  errors.push("Release manifest production baseline SHA changed unexpectedly; reconcile current production before release.");
}

for (const file of manifest.requiredFiles ?? []) requireFile(file);
for (const migration of manifest.requiredSourceMigrations ?? []) requireFile(migration);

// Guard against accidentally granting direct CRUD access on Z-Girl tables in the consolidated migrations.
const directTableGrant = /grant\s+(?:select|insert|update|delete|truncate|references|trigger|all(?:\s+privileges)?)\b[\s\S]{0,240}?\bon\s+(?:table\s+)?(?:public\.)?zgirl_[a-z0-9_]+[\s\S]{0,160}?\bto\s+(?:anon|authenticated)\b/i;
for (const migration of manifest.requiredSourceMigrations ?? []) {
  if (!fs.existsSync(path.join(root, migration))) continue;
  if (directTableGrant.test(read(migration))) errors.push(`Direct anon/authenticated Z-Girl table grant detected in ${migration}`);
}

// Authentication/authorization must remain server-side on every high-power consolidated surface.
const guardedRoutes = [
  ["app/api/institutions/ops/briefings/dashboard/route.ts", /requireOperatorCapability|credentialSessionToken/],
  ["app/api/institutions/ops/identity/dashboard/route.ts", /credentialSessionToken/],
  ["app/api/institutions/ops/portfolio/dashboard/route.ts", /requireOperatorCapability|credentialSessionToken/],
  ["app/api/institutions/ops/pipeline/dashboard/route.ts", /requireOperatorCapability|credentialSessionToken/],
  ["app/api/institutions/ops/workflows/dashboard/route.ts", /requireOperatorCapability|credentialSessionToken/],
  ["app/api/institutions/ops/dashboard/route.ts", /requireOperatorCapability|credentialSessionToken/],
  ["app/api/institutions/ops/governance/action/route.ts", /requireOperatorCapability/],
  ["app/api/institutions/ops/board-governance/dashboard/route.ts", /requireOperatorCapability/],
  ["app/api/institutions/ops/board-governance/action/route.ts", /requireOperatorCapability/],
  ["app/api/institutions/ops/board-governance/export/route.ts", /requireOperatorCapability/],
  ["app/api/institutions/ops/board-governance/packet/route.ts", /requireOperatorCapability/],
  ["app/api/credentials/ops/dashboard/route.ts", /credentialSessionToken|requireOperatorCapability/]
];
for (const [file, guard] of guardedRoutes) requireText(file, [guard, /credentialErrorResponse|unauthorized/]);

// Commerce must remain seller-first and HTTPS-only; four public digital offers are the current checkout gate.
requireText("lib/commerce.ts", [
  /if\s*\(!getSellerName\(\)\)\s*return\s+null/,
  /ZGIRL_CHECKOUT_LINKS_JSON/,
  /url\.protocol\s*!==\s*["']https:["']/
]);
const commerceSource = read("lib/commerce.ts");
const checkoutOfferCount = (commerceSource.match(/mode:\s*["']checkout["']/g) ?? []).length;
if (checkoutOfferCount !== 4) errors.push(`Expected 4 checkout offers; found ${checkoutOfferCount}. Reconcile commerce gate before release.`);
requireText("app/api/commerce/status/route.ts", [/sellerConfigured/, /leadDeliveryConfigured/, /readyForPaidLaunch/, /Cache-Control/]);

// Scheduled jobs in the release manifest must remain uniquely named and uniquely scheduled in the intended order.
const jobs = manifest.scheduledJobs ?? [];
if (new Set(jobs.map((job) => job.name)).size !== jobs.length) errors.push("Duplicate scheduled job name in release manifest.");
const expectedJobs = [
  ["zgirl-tenant-access-review-daily", "47 9 * * *"],
  ["zgirl-institution-workflow-daily", "7 10 * * *"],
  ["zgirl-credential-renewal-daily", "17 10 * * *"],
  ["zgirl-institution-license-daily", "27 10 * * *"],
  ["zgirl-executive-briefing-daily", "37 11 * * *"],
  ["zgirl-governance-calendar-daily", "7 12 * * *"]
];
for (const [name, schedule] of expectedJobs) {
  const job = jobs.find((candidate) => candidate.name === name);
  if (!job || job.schedule !== schedule) errors.push(`Scheduled job mismatch: ${name} expected ${schedule}`);
}

// Track the known lockfile debt explicitly. Do not silently switch back to npm ci until the lock is actually current.
const lock = readJson("package-lock.json");
const lockRoot = lock.packages?.[""] ?? {};
const lockHasQr = Boolean(lockRoot.dependencies?.qrcode && lockRoot.devDependencies?.["@types/qrcode"]);
const lockVersionCurrent = lock.version === pkg.version && lockRoot.version === pkg.version;
const lockIsCurrent = lockHasQr && lockVersionCurrent;
if (!lockIsCurrent) {
  if (manifest.knownDebt?.packageLockStale !== true) {
    errors.push("package-lock.json is stale but the release manifest does not explicitly acknowledge the debt.");
  } else {
    warnings.push(`Known lockfile debt remains: root=${lock.version}/${lockRoot.version}, qrcodeRecorded=${lockHasQr}. CI must use npm install.`);
  }
} else if (manifest.knownDebt?.packageLockStale === true) {
  warnings.push("package-lock.json now appears current; remove the stale-lockfile debt from the manifest and restore npm ci after re-verification.");
}

const verifyWorkflow = read(".github/workflows/verify-release.yml");
if (!lockIsCurrent && !/npm install --no-audit --no-fund/.test(verifyWorkflow)) {
  errors.push("Stale lockfile requires Verify Release to use npm install until package-lock.json is regenerated.");
}

if ((manifest.databaseBaseline?.zgirlPublicTables ?? 0) < 43) errors.push("Release manifest database baseline unexpectedly lost Z-Girl tables.");
if (manifest.databaseBaseline?.directAnonAuthenticatedTableGrants !== 0) errors.push("Release manifest must require zero direct anon/authenticated Z-Girl table grants.");
if (manifest.productionBaseline?.commerce?.readyForPaidLaunch !== false) errors.push("v3.10 consolidation must not implicitly authorize paid launch.");

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error(`Release-train verification failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`Z-Girl release-train verification passed for ${pkg.version}.`);
console.log(`Required source migrations: ${(manifest.requiredSourceMigrations ?? []).length}`);
console.log(`Required consolidated files: ${(manifest.requiredFiles ?? []).length}`);
console.log(`Scheduled governance jobs: ${jobs.length}`);
console.log(`Known warnings: ${warnings.length}`);
