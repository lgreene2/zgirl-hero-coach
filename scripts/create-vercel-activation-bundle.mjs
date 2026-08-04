import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const EXPECTED_CANDIDATE = "ZGIRL-AUDIO-RC2-F5-2026-08-03";
const EXPECTED_LOCALES = ["es-US", "fr-FR", "pt-BR", "de-DE"];

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

function normalizeGatewayBaseUrl(input) {
  const url = new URL(input);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("The gateway URL must use HTTPS.");
  }
  url.search = "";
  url.hash = "";
  const cleanPath = url.pathname.replace(/\/$/, "");
  url.pathname = cleanPath.endsWith("/api/review-assets")
    ? cleanPath
    : `${cleanPath}/api/review-assets`.replace(/\/+/g, "/");
  return url.toString().replace(/\/$/, "");
}

function validateRecord(record) {
  if (!record || typeof record !== "object") {
    throw new Error("Activation record must be a JSON object.");
  }
  if (record.candidateId !== EXPECTED_CANDIDATE) {
    throw new Error(`Unexpected candidate ID: ${record.candidateId || "missing"}.`);
  }
  if (!Array.isArray(record.credentials)) {
    throw new Error("Activation record is missing reviewer credentials.");
  }

  const credentials = new Map(
    record.credentials.map((credential) => [credential.locale, credential]),
  );
  for (const locale of EXPECTED_LOCALES) {
    const credential = credentials.get(locale);
    if (!credential || typeof credential.accessCode !== "string" || !credential.accessCode.trim()) {
      throw new Error(`Activation record is missing the ${locale} access code.`);
    }
  }

  const publicVars = record.vercelEnvironment?.publicZgirlProject;
  const privateVars = record.vercelEnvironment?.privateGatewayProject;
  for (const key of [
    "ZGIRL_REVIEW_ACCESS_HASHES_JSON",
    "ZGIRL_REVIEW_SESSION_SECRET",
    "ZGIRL_REVIEW_ASSET_BEARER_TOKEN",
  ]) {
    if (typeof publicVars?.[key] !== "string" || !publicVars[key].trim()) {
      throw new Error(`Activation record is missing ${key}.`);
    }
  }
  if (
    typeof privateVars?.ZGIRL_ASSET_GATEWAY_BEARER_TOKEN !== "string" ||
    !privateVars.ZGIRL_ASSET_GATEWAY_BEARER_TOKEN.trim()
  ) {
    throw new Error("Activation record is missing ZGIRL_ASSET_GATEWAY_BEARER_TOKEN.");
  }
  if (
    publicVars.ZGIRL_REVIEW_ASSET_BEARER_TOKEN !==
    privateVars.ZGIRL_ASSET_GATEWAY_BEARER_TOKEN
  ) {
    throw new Error("Public and private gateway bearer tokens do not match.");
  }

  return { publicVars, privateVars };
}

function envText(entries) {
  return `${Object.entries(entries)
    .map(([key, value]) => `${key}=${String(value).replace(/\r?\n/g, "")}`)
    .join("\n")}\n`;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function reviewerCsv(credentials) {
  const rows = [
    ["locale", "language", "reviewer", "reviewerEmail", "accessCode"],
    ...credentials.map((credential) => [
      credential.locale,
      credential.label || "",
      credential.reviewer || "",
      credential.reviewerEmail || "",
      credential.accessCode,
    ]),
  ];
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function powershellScript() {
  return [
    "param(",
    '  [string]$Scope = "lgreene2s-projects",',
    '  [string]$GatewayProject = "zgirl-review-asset-gateway",',
    '  [string]$PublicProject = "zgirl-hero-coach",',
    '  [string]$GatewayDeploymentUrl = "",',
    '  [string]$PublicDeploymentUrl = ""',
    ")",
    "",
    "Set-StrictMode -Version Latest",
    '$ErrorActionPreference = "Stop"',
    "$BundleRoot = Split-Path -Parent $MyInvocation.MyCommand.Path",
    "",
    "function Invoke-Vercel {",
    "  param([string[]]$CommandArgs)",
    "  & npx --yes vercel@latest @CommandArgs",
    "  if ($LASTEXITCODE -ne 0) {",
    '    throw "Vercel CLI command failed: vercel $($CommandArgs -join \' \')"',
    "  }",
    "}",
    "",
    "function Read-EnvFile {",
    "  param([string]$Path)",
    "  $entries = @()",
    "  foreach ($line in Get-Content -LiteralPath $Path) {",
    '    if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith("#")) { continue }',
    '    $separator = $line.IndexOf("=")',
    '    if ($separator -lt 1) { throw "Invalid environment line in $Path" }',
    "    $entries += [PSCustomObject]@{",
    "      Name = $line.Substring(0, $separator)",
    "      Value = $line.Substring($separator + 1)",
    "    }",
    "  }",
    "  return $entries",
    "}",
    "",
    "function Ensure-VercelLogin {",
    "  & npx --yes vercel@latest whoami *> $null",
    "  if ($LASTEXITCODE -ne 0) {",
    '    Write-Host "Vercel login is required. A browser login flow will open." -ForegroundColor Yellow',
    '    Invoke-Vercel -CommandArgs @("login")',
    "  }",
    "}",
    "",
    "function Set-ProjectVariables {",
    "  param([string]$Project, [string]$EnvFile)",
    '  $working = Join-Path ([System.IO.Path]::GetTempPath()) ("zgirl-vercel-" + [guid]::NewGuid().ToString("N"))',
    "  New-Item -ItemType Directory -Path $working | Out-Null",
    "  Push-Location $working",
    "  try {",
    '    Write-Host "Linking Vercel project $Project..."',
    '    Invoke-Vercel -CommandArgs @("link", "--yes", "--project", $Project, "--scope", $Scope)',
    "    foreach ($entry in Read-EnvFile $EnvFile) {",
    '      foreach ($target in @("production", "preview")) {',
    "        & npx --yes vercel@latest env rm $entry.Name $target --yes --scope $Scope *> $null",
    "        $entry.Value | & npx --yes vercel@latest env add $entry.Name $target --force --sensitive --scope $Scope *> $null",
    "        if ($LASTEXITCODE -ne 0) {",
    '          throw "Unable to set $($entry.Name) for $Project/$target"',
    "        }",
    "      }",
    '      Write-Host "Configured $($entry.Name) for $Project without displaying its value."',
    "    }",
    "  } finally {",
    "    Pop-Location",
    "    Remove-Item -LiteralPath $working -Recurse -Force -ErrorAction SilentlyContinue",
    "  }",
    "}",
    "",
    "Ensure-VercelLogin",
    'Set-ProjectVariables -Project $GatewayProject -EnvFile (Join-Path $BundleRoot "private-gateway.env")',
    'Set-ProjectVariables -Project $PublicProject -EnvFile (Join-Path $BundleRoot "public-zgirl.env")',
    "",
    "if (-not [string]::IsNullOrWhiteSpace($GatewayDeploymentUrl)) {",
    '  Invoke-Vercel -CommandArgs @("redeploy", $GatewayDeploymentUrl, "--yes", "--scope", $Scope)',
    "}",
    "if (-not [string]::IsNullOrWhiteSpace($PublicDeploymentUrl)) {",
    '  Invoke-Vercel -CommandArgs @("redeploy", $PublicDeploymentUrl, "--yes", "--scope", $Scope)',
    "}",
    "",
    'Write-Host "Protected Vercel variables are configured." -ForegroundColor Green',
    'Write-Host "Run verify-review-activation.ps1 after both production deployments are READY."',
    "",
  ].join("\n");
}

function verifyPowerShellScript() {
  return [
    "param(",
    '  [string]$PublicUrl = "https://zgirlinitiative.org"',
    ")",
    "",
    "Set-StrictMode -Version Latest",
    '$ErrorActionPreference = "Stop"',
    "$BundleRoot = Split-Path -Parent $MyInvocation.MyCommand.Path",
    '& node (Join-Path $BundleRoot "verify-review-activation.mjs") --record (Join-Path $BundleRoot "activation-record.json") --public-url $PublicUrl',
    "if ($LASTEXITCODE -ne 0) { throw \"Z-Girl reviewer activation verification failed.\" }",
    'Write-Host "Z-Girl reviewer activation passed." -ForegroundColor Green',
    "",
  ].join("\n");
}

function readmeText(gatewayBaseUrl) {
  return [
    "Z-GIRL v2.2.3 CONFIDENTIAL ACTIVATION BUNDLE",
    "",
    "WARNING",
    "This folder contains plaintext reviewer codes and deployment secrets. Keep it private. Do not upload it to GitHub, email it broadly, or place it in a shared drive.",
    "",
    "PRIVATE GATEWAY IMPORT",
    "1. While signed in to Vercel, open:",
    "   https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flgreene2%2Fzgirl-native-language-review-portal&project-name=zgirl-review-asset-gateway&repository-name=zgirl-review-asset-gateway",
    "2. Import the private repository as zgirl-review-asset-gateway.",
    "3. Keep the repository and project private.",
    "4. The private environment file in this bundle is private-gateway.env.",
    "",
    "AUTOMATED ENVIRONMENT SETUP",
    "After the private project exists, open PowerShell in this folder and run:",
    "",
    "  powershell -ExecutionPolicy Bypass -File .\\apply-vercel-env.ps1",
    "",
    "The script signs in to Vercel if needed and applies all protected variables to Production and Preview without displaying their values.",
    "",
    "GATEWAY BASE URL",
    gatewayBaseUrl,
    "",
    "REDEPLOYMENT",
    "Environment changes apply only to new deployments. Redeploy the private gateway and then the public zgirl-hero-coach project.",
    "",
    "END-TO-END VERIFICATION",
    "After both projects report READY, run:",
    "",
    "  powershell -ExecutionPolicy Bypass -File .\\verify-review-activation.ps1",
    "",
    "The verifier tests all four reviewer logins, all 56 proxied audio tracks, invalid-code rejection, unauthenticated blocking, language isolation, protected review access, and logout cookie clearing.",
    "",
    "REVIEWER HANDOFF",
    "reviewer-credentials.csv contains one plaintext code per language. Send each reviewer only the assigned row. Do not send the full file.",
    "",
    "RELEASE BOUNDARY",
    "Successful activation authorizes controlled review only. It does not approve or publicly release the candidate recordings.",
    "",
  ].join("\n");
}

async function secureWrite(filePath, content) {
  await writeFile(filePath, content, { encoding: "utf8", mode: 0o600 });
  await chmod(filePath, 0o600).catch(() => undefined);
}

const args = parseArgs(process.argv.slice(2));
const recordPath = args.record;
const gatewayInput = args["gateway-url"];
const outInput = args.out || "private-zgirl-activation-bundle";

if (
  typeof recordPath !== "string" ||
  !recordPath.trim() ||
  typeof gatewayInput !== "string" ||
  !gatewayInput.trim()
) {
  console.error(
    "Usage: npm run review:activation-bundle -- --record /private/activation-record.json --gateway-url https://private-host --out /private/output-folder",
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

let validated;
let gatewayBaseUrl;
try {
  validated = validateRecord(record);
  gatewayBaseUrl = normalizeGatewayBaseUrl(gatewayInput);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}

const outDir = path.resolve(outInput);
try {
  await mkdir(outDir, { recursive: false, mode: 0o700 });
} catch (error) {
  if (error?.code === "EEXIST") {
    console.error(`Output directory already exists: ${outDir}. Choose a new private directory.`);
    process.exit(2);
  }
  throw error;
}
await chmod(outDir, 0o700).catch(() => undefined);

const publicEnvironment = {
  ZGIRL_REVIEW_ACCESS_HASHES_JSON:
    validated.publicVars.ZGIRL_REVIEW_ACCESS_HASHES_JSON,
  ZGIRL_REVIEW_SESSION_SECRET:
    validated.publicVars.ZGIRL_REVIEW_SESSION_SECRET,
  ZGIRL_REVIEW_ASSET_BASE_URL: gatewayBaseUrl,
  ZGIRL_REVIEW_ASSET_BEARER_TOKEN:
    validated.publicVars.ZGIRL_REVIEW_ASSET_BEARER_TOKEN,
};
const privateEnvironment = {
  ZGIRL_ASSET_GATEWAY_BEARER_TOKEN:
    validated.privateVars.ZGIRL_ASSET_GATEWAY_BEARER_TOKEN,
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const verifierSource = await readFile(
  path.join(scriptDirectory, "verify-review-activation.mjs"),
  "utf8",
);

await Promise.all([
  secureWrite(
    path.join(outDir, "activation-record.json"),
    `${JSON.stringify(record, null, 2)}\n`,
  ),
  secureWrite(path.join(outDir, "private-gateway.env"), envText(privateEnvironment)),
  secureWrite(path.join(outDir, "public-zgirl.env"), envText(publicEnvironment)),
  secureWrite(
    path.join(outDir, "reviewer-credentials.csv"),
    reviewerCsv(record.credentials),
  ),
  secureWrite(path.join(outDir, "apply-vercel-env.ps1"), powershellScript()),
  secureWrite(
    path.join(outDir, "verify-review-activation.ps1"),
    verifyPowerShellScript(),
  ),
  secureWrite(path.join(outDir, "verify-review-activation.mjs"), verifierSource),
  secureWrite(path.join(outDir, "README.txt"), readmeText(gatewayBaseUrl)),
  secureWrite(path.join(outDir, ".gitignore"), "*\n!.gitignore\n"),
]);

console.log(`Created confidential activation bundle: ${outDir}`);
console.log("No reviewer code, bearer token, session secret, or hash map was displayed.");
