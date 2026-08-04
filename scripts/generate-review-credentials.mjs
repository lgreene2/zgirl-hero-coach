import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const CANDIDATE_ID = "ZGIRL-AUDIO-RC2-F5-2026-08-03";
const LANGUAGES = [
  { locale: "es-US", label: "Spanish (United States)" },
  { locale: "fr-FR", label: "French (France)" },
  { locale: "pt-BR", label: "Portuguese (Brazil)" },
  { locale: "de-DE", label: "German (Germany)" },
];

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

const outputArg = argument("--out");
if (!outputArg) {
  console.error(
    "Usage: npm run review:credentials -- --out /absolute/private/path/private-review-credentials.json",
  );
  process.exit(2);
}

const outputPath = path.resolve(outputArg);
const accessHashes = {};
const credentials = LANGUAGES.map((language) => {
  const accessCode = randomBytes(18).toString("base64url");
  accessHashes[language.locale] = createHash("sha256")
    .update(accessCode, "utf8")
    .digest("hex");
  return {
    ...language,
    reviewer: "",
    reviewerEmail: "",
    accessCode,
  };
});

const gatewayBearerToken = randomBytes(48).toString("base64url");
const record = {
  candidateId: CANDIDATE_ID,
  generatedAt: new Date().toISOString(),
  warning:
    "CONFIDENTIAL. Share each plaintext reviewer code only with its assigned reviewer. Store deployment secrets only in the named Vercel projects. Never commit or upload this file to a public location.",
  credentials,
  vercelEnvironment: {
    publicZgirlProject: {
      ZGIRL_REVIEW_ACCESS_HASHES_JSON: JSON.stringify(accessHashes),
      ZGIRL_REVIEW_SESSION_SECRET: randomBytes(48).toString("base64url"),
      ZGIRL_REVIEW_ASSET_BASE_URL:
        "https://<private-gateway-host>/api/review-assets",
      ZGIRL_REVIEW_ASSET_BEARER_TOKEN: gatewayBearerToken,
    },
    privateGatewayProject: {
      ZGIRL_ASSET_GATEWAY_BEARER_TOKEN: gatewayBearerToken,
    },
  },
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
const handle = await fs.open(outputPath, "wx", 0o600).catch((error) => {
  if (error?.code === "EEXIST") {
    console.error(`Refusing to overwrite existing credential file: ${outputPath}`);
    process.exit(3);
  }
  throw error;
});
await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, "utf8");
await handle.close();
await fs.chmod(outputPath, 0o600);

console.log(`Created confidential reviewer credential record at ${outputPath}`);
console.log(
  "Plaintext reviewer codes and deployment secrets were written only to that file and were not printed.",
);
