import { readFile } from "node:fs/promises";
import process from "node:process";

const EXPECTED_LOCALES = ["es-US", "fr-FR", "pt-BR", "de-DE"];
const MIXES = ["voice", "calm"];

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
    } else {
      options[key] = next;
      index += 1;
    }
  }
  return options;
}

function normalizePublicUrl(input) {
  const url = new URL(input || "https://zgirlinitiative.org");
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("The public reviewer URL must use HTTPS.");
  }
  url.pathname = url.pathname.replace(/\/$/, "");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function privateFetch(url, init = {}) {
  return fetch(url, {
    ...init,
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
}

function cookieFrom(response) {
  const raw = response.headers.get("set-cookie") || "";
  return raw.split(";", 1)[0] || "";
}

function requiredCredentialMap(record) {
  if (!Array.isArray(record.credentials)) {
    throw new Error("Activation record is missing credentials.");
  }
  const map = new Map(
    record.credentials.map((credential) => [credential.locale, credential]),
  );
  for (const locale of EXPECTED_LOCALES) {
    const credential = map.get(locale);
    if (!credential || typeof credential.accessCode !== "string" || !credential.accessCode.trim()) {
      throw new Error(`Activation record is missing a plaintext access code for ${locale}.`);
    }
  }
  return map;
}

async function login(publicUrl, locale, code) {
  return privateFetch(`${publicUrl}/api/review/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale, code }),
  });
}

async function verifyTrack(publicUrl, cookie, locale, day, mix) {
  const url = new URL(`${publicUrl}/api/review/audio`);
  url.searchParams.set("locale", locale);
  url.searchParams.set("day", String(day));
  url.searchParams.set("mix", mix);

  try {
    const response = await privateFetch(url, {
      headers: {
        Cookie: cookie,
        Range: "bytes=0-0",
      },
    });
    const contentType = response.headers.get("content-type") || "";
    const contentRange = response.headers.get("content-range") || "";
    const cacheControl = response.headers.get("cache-control") || "";
    const ok =
      response.status === 206 &&
      contentType.toLowerCase().startsWith("audio/") &&
      /^bytes 0-0\/\d+$/.test(contentRange) &&
      cacheControl.toLowerCase().includes("no-store");
    await response.body?.cancel();
    return {
      locale,
      day,
      mix,
      ok,
      status: response.status,
      contentType: contentType || "missing",
      contentRange: contentRange || "missing",
      cacheControl: cacheControl || "missing",
    };
  } catch (error) {
    return {
      locale,
      day,
      mix,
      ok: false,
      status: "network-error",
      contentType: error instanceof Error ? error.name : "unknown",
      contentRange: "missing",
      cacheControl: "missing",
    };
  }
}

async function verifyLocale(publicUrl, credentialMap, locale) {
  const credential = credentialMap.get(locale);
  const response = await login(publicUrl, locale, credential.accessCode.trim());
  const setCookie = response.headers.get("set-cookie") || "";
  const cookie = cookieFrom(response);
  const loginJson = await response.json().catch(() => ({}));
  const loginOk =
    response.status === 200 &&
    loginJson?.ok === true &&
    loginJson?.locale === locale &&
    Boolean(cookie) &&
    /HttpOnly/i.test(setCookie) &&
    /SameSite=Strict/i.test(setCookie) &&
    /Max-Age=28800/i.test(setCookie);

  if (!loginOk) {
    return {
      locale,
      loginOk: false,
      loginStatus: response.status,
      failures: [
        {
          locale,
          day: 0,
          mix: "login",
          status: response.status,
          contentType: response.headers.get("content-type") || "missing",
          contentRange: "not-applicable",
          cacheControl: response.headers.get("cache-control") || "missing",
        },
      ],
      passedTracks: 0,
      totalTracks: 14,
      pageOk: false,
      isolationOk: false,
      logoutOk: false,
    };
  }

  const pageResponse = await privateFetch(`${publicUrl}/review`, {
    headers: { Cookie: cookie },
  });
  const pageOk = pageResponse.status === 200;
  await pageResponse.body?.cancel();

  const checks = [];
  for (let day = 1; day <= 7; day += 1) {
    for (const mix of MIXES) checks.push({ locale, day, mix });
  }

  const results = [];
  const pending = [...checks];
  const workers = Array.from({ length: 4 }, async () => {
    while (pending.length) {
      const item = pending.shift();
      if (item) {
        results.push(
          await verifyTrack(publicUrl, cookie, item.locale, item.day, item.mix),
        );
      }
    }
  });
  await Promise.all(workers);

  const otherLocale = EXPECTED_LOCALES.find((candidate) => candidate !== locale);
  const isolationUrl = new URL(`${publicUrl}/api/review/audio`);
  isolationUrl.searchParams.set("locale", otherLocale);
  isolationUrl.searchParams.set("day", "1");
  isolationUrl.searchParams.set("mix", "voice");
  const isolationResponse = await privateFetch(isolationUrl, {
    headers: { Cookie: cookie, Range: "bytes=0-0" },
  });
  const isolationOk = isolationResponse.status === 403;
  await isolationResponse.body?.cancel();

  const logoutResponse = await privateFetch(`${publicUrl}/api/review/session`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  const logoutCookie = logoutResponse.headers.get("set-cookie") || "";
  const logoutOk =
    logoutResponse.status === 200 &&
    (/Max-Age=0/i.test(logoutCookie) || /Expires=/i.test(logoutCookie));
  await logoutResponse.body?.cancel();

  return {
    locale,
    loginOk,
    loginStatus: response.status,
    failures: results.filter(({ ok }) => !ok),
    passedTracks: results.filter(({ ok }) => ok).length,
    totalTracks: results.length,
    pageOk,
    isolationOk,
    logoutOk,
  };
}

const args = parseArgs(process.argv.slice(2));
const recordPath = args.record;
if (typeof recordPath !== "string" || !recordPath.trim()) {
  console.error(
    "Usage: npm run review:verify-activation -- --record /private/activation-record.json [--public-url https://zgirlinitiative.org]",
  );
  process.exit(2);
}

let record;
try {
  record = JSON.parse(await readFile(recordPath, "utf8"));
} catch (error) {
  console.error(
    `Unable to read the confidential activation record: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(2);
}

let publicUrl;
let credentialMap;
try {
  publicUrl = normalizePublicUrl(args["public-url"]);
  credentialMap = requiredCredentialMap(record);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}

const failures = [];

const wrongCodeResponse = await login(
  publicUrl,
  EXPECTED_LOCALES[0],
  `${credentialMap.get(EXPECTED_LOCALES[0]).accessCode.trim()}-invalid`,
);
if (wrongCodeResponse.status !== 401) {
  failures.push(
    `Invalid access code returned ${wrongCodeResponse.status}; expected 401.`,
  );
}
await wrongCodeResponse.body?.cancel();

const unauthenticatedUrl = new URL(`${publicUrl}/api/review/audio`);
unauthenticatedUrl.searchParams.set("locale", EXPECTED_LOCALES[0]);
unauthenticatedUrl.searchParams.set("day", "1");
unauthenticatedUrl.searchParams.set("mix", "voice");
const unauthenticatedResponse = await privateFetch(unauthenticatedUrl, {
  headers: { Range: "bytes=0-0" },
});
if (unauthenticatedResponse.status !== 401) {
  failures.push(
    `Unauthenticated audio returned ${unauthenticatedResponse.status}; expected 401.`,
  );
}
await unauthenticatedResponse.body?.cancel();

const localeResults = await Promise.all(
  EXPECTED_LOCALES.map((locale) =>
    verifyLocale(publicUrl, credentialMap, locale),
  ),
);

let passedTracks = 0;
let totalTracks = 0;
for (const result of localeResults) {
  passedTracks += result.passedTracks;
  totalTracks += result.totalTracks;
  console.log(
    `${result.locale}: login ${result.loginOk ? "passed" : "failed"}; ` +
      `tracks ${result.passedTracks}/${result.totalTracks}; ` +
      `page ${result.pageOk ? "passed" : "failed"}; ` +
      `isolation ${result.isolationOk ? "passed" : "failed"}; ` +
      `logout ${result.logoutOk ? "passed" : "failed"}`,
  );
  if (!result.loginOk) failures.push(`${result.locale} reviewer login failed.`);
  if (!result.pageOk) failures.push(`${result.locale} protected review page failed.`);
  if (!result.isolationOk) failures.push(`${result.locale} language isolation failed.`);
  if (!result.logoutOk) failures.push(`${result.locale} logout cookie clearing failed.`);
  for (const item of result.failures) {
    failures.push(
      `${item.locale} day ${item.day} ${item.mix}: ${item.status} ` +
        `(${item.contentType}; ${item.contentRange}; ${item.cacheControl})`,
    );
  }
}

if (failures.length) {
  console.error("Reviewer activation verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `All ${passedTracks}/${totalTracks} public reviewer audio checks passed across four language-scoped sessions.`,
);
console.log(
  "Invalid credentials, unauthenticated access, cross-language access, protected-page access, and logout behavior passed.",
);
