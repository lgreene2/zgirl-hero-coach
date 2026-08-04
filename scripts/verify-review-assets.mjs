const CANDIDATE_ID = "ZGIRL-AUDIO-RC2-F5-2026-08-03";
const LOCALES = ["es-US", "fr-FR", "pt-BR", "de-DE"];
const MIXES = ["voice", "calm"];
const baseUrl = process.env.ZGIRL_REVIEW_ASSET_BASE_URL?.replace(/\/$/, "");
const bearer = process.env.ZGIRL_REVIEW_ASSET_BEARER_TOKEN;

if (!baseUrl) {
  console.error("ZGIRL_REVIEW_ASSET_BASE_URL is required.");
  process.exit(2);
}

const checks = [];
for (const locale of LOCALES) {
  for (let day = 1; day <= 7; day += 1) {
    for (const mix of MIXES) checks.push({ locale, day, mix });
  }
}

async function verify(item) {
  const url = `${baseUrl}/${encodeURIComponent(CANDIDATE_ID)}/${encodeURIComponent(item.locale)}/day-${item.day}-${item.mix}.mp3`;
  const headers = { Range: "bytes=0-0" };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  try {
    const response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(15000) });
    const contentType = response.headers.get("content-type") || "";
    const ok = (response.status === 200 || response.status === 206) && contentType.toLowerCase().startsWith("audio/");
    await response.body?.cancel();
    return { ...item, ok, status: response.status, contentType: contentType || "missing" };
  } catch (error) {
    return { ...item, ok: false, status: "network-error", contentType: error instanceof Error ? error.name : "unknown" };
  }
}

const results = [];
const pending = [...checks];
const workers = Array.from({ length: 6 }, async () => {
  while (pending.length) {
    const item = pending.shift();
    if (item) results.push(await verify(item));
  }
});
await Promise.all(workers);

results.sort((a, b) => a.locale.localeCompare(b.locale) || a.day - b.day || a.mix.localeCompare(b.mix));
const failures = results.filter(({ ok }) => !ok);
for (const locale of LOCALES) {
  const localeResults = results.filter((item) => item.locale === locale);
  console.log(`${locale}: ${localeResults.filter(({ ok }) => ok).length}/${localeResults.length} candidate tracks available`);
}
if (failures.length) {
  console.error("Unavailable or invalid tracks:");
  for (const item of failures) console.error(`- ${item.locale} day ${item.day} ${item.mix}: ${item.status} (${item.contentType})`);
  process.exit(1);
}
console.log(`All ${results.length} protected candidate tracks passed the availability and media-type gate.`);
