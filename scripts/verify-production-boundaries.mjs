const args = process.argv.slice(2);
const value = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const flag = (name) => args.includes(name);

const baseUrl = (value("--base-url", "https://zgirlinitiative.org") || "").replace(/\/$/, "");
const expectedVersion = value("--expected-version", "3.10.0");
const expectedCommit = value("--expected-git-commit");
const allowPaidLaunch = flag("--allow-paid-launch");
const failures = [];
const checks = [];

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    redirect: "manual",
    cache: "no-store",
    ...options,
    headers: { "User-Agent": "zgirl-production-boundary-verifier/3.10", ...(options.headers ?? {}) },
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { url, response, text, json };
}

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
  console.log(`PASS: ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  failures.push(`${name}: ${detail}`);
  console.error(`FAIL: ${name} — ${detail}`);
}

async function expectStatus(name, path, expectedStatus, options) {
  try {
    const result = await request(path, options);
    if (result.response.status !== expectedStatus) {
      fail(name, `${result.url} returned ${result.response.status}; expected ${expectedStatus}`);
    } else {
      pass(name, `${expectedStatus}`);
    }
    return result;
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
    return null;
  }
}

const release = await expectStatus("release status endpoint", "/api/release/status", 200);
if (release?.json) {
  if (release.json.version === expectedVersion) pass("release version", release.json.version);
  else fail("release version", `found ${release.json.version}; expected ${expectedVersion}`);
  if (release.json.releaseTrain === "v3.4-v3.9-consolidated") pass("release train identity", release.json.releaseTrain);
  else fail("release train identity", `unexpected ${release.json.releaseTrain}`);
  if (release.json.commerceGateSeparate === true) pass("commerce authority separation");
  else fail("commerce authority separation", "commerceGateSeparate must be true");
  if (release.json.participantPrivateReflectionAdminAccess === false) pass("participant private-reflection admin boundary");
  else fail("participant private-reflection admin boundary", "admin access flag must remain false");
  if (expectedCommit) {
    const actual = String(release.json.gitCommit ?? "");
    if (actual === expectedCommit || actual.startsWith(expectedCommit) || expectedCommit.startsWith(actual)) pass("deployed git commit", actual);
    else fail("deployed git commit", `found ${actual || "null"}; expected ${expectedCommit}`);
  }
} else if (release) {
  fail("release status payload", "response was not JSON");
}

const publicRoutes = [
  "/institutions/executive-briefing-automation",
  "/institutions/identity-access",
  "/institutions/access-governance-evidence",
  "/institutions/governance-calendar",
  "/institutions/board-governance-reporting",
  "/credentials/verify"
];
for (const route of publicRoutes) await expectStatus(`public route ${route}`, route, 200);

const restrictedApis = [
  "/api/credentials/ops/dashboard",
  "/api/institutions/ops/dashboard",
  "/api/institutions/ops/portfolio/dashboard",
  "/api/institutions/ops/briefings/dashboard",
  "/api/institutions/ops/identity/dashboard",
  "/api/institutions/ops/pipeline/dashboard",
  "/api/institutions/ops/workflows/dashboard",
  "/api/institutions/ops/board-governance/dashboard?institutionId=00000000-0000-4000-8000-000000000000&periodStart=2026-01-01&periodEnd=2026-12-31"
];
for (const route of restrictedApis) await expectStatus(`unauthenticated boundary ${route.split("?")[0]}`, route, 401);

const credential = await expectStatus("unknown exact-format credential request", "/api/credentials/verify?id=ZG-AF-2026-DEADBEEF00", 200);
if (credential?.json) {
  if (credential.json.found === false && credential.json.credential == null) pass("unknown credential non-disclosure");
  else fail("unknown credential non-disclosure", `unexpected payload ${credential.text.slice(0, 300)}`);
}

const commerce = await expectStatus("commerce status endpoint", "/api/commerce/status", 200);
if (commerce?.json) {
  if (commerce.json.requiredCheckoutCount === 4) pass("commerce checkout gate count", "4");
  else fail("commerce checkout gate count", `found ${commerce.json.requiredCheckoutCount}; expected 4`);
  if (allowPaidLaunch) {
    pass("commerce launch posture", `paid launch allowed by verifier; current=${Boolean(commerce.json.readyForPaidLaunch)}`);
  } else if (commerce.json.readyForPaidLaunch === false) {
    pass("commerce remains gated");
  } else {
    fail("commerce remains gated", "readyForPaidLaunch unexpectedly true; use --allow-paid-launch only after separate commercial authorization");
  }
}

console.log(`\nBoundary checks completed: ${checks.length}; failures: ${failures.length}.`);
if (failures.length) {
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log("Z-Girl production boundary verification passed.");
