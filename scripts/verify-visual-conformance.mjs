import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const heroPath = path.join(repoRoot, 'components', 'CommercialHumanHero.tsx');
const heroSource = fs.readFileSync(heroPath, 'utf8');

const requiredVariants = ['athlete', 'faith', 'institution', 'family', 'partner'];
const forbiddenAssets = [
  'photo-1517466787929-bc90951d0974',
  'photo-1520857014576-2c4f4c972b57',
];
const approvedMarketAssets = [
  'photo-1768349027535-da4842dab8ba',
  'photo-1651514645933-c26e0eb4ace3',
];
const requiredPhrases = ['semanticIntent:', 'sourceNote:', 'data-semantic-intent='];
const scanRoots = ['app', 'components'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md']);
const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (textExtensions.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

for (const variant of requiredVariants) {
  if (!heroSource.includes(`${variant}: {`)) failures.push(`Missing governed visual variant: ${variant}`);
}
for (const phrase of requiredPhrases) {
  if (!heroSource.includes(phrase)) failures.push(`Missing visual-conformance marker: ${phrase}`);
}
for (const asset of approvedMarketAssets) {
  if (!heroSource.includes(asset)) failures.push(`Missing approved market visual: ${asset}`);
}

const scannedFiles = scanRoots.flatMap((root) => walk(path.join(repoRoot, root)));
for (const file of scannedFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const asset of forbiddenAssets) {
    if (source.includes(asset)) {
      failures.push(`Rejected visual asset found in rendered-code path: ${path.relative(repoRoot, file)} -> ${asset}`);
    }
  }
}

const contextPath = path.join(repoRoot, 'components', 'HumanContextStrip.tsx');
if (!fs.existsSync(contextPath)) failures.push('Missing HumanContextStrip.tsx');
else {
  const contextSource = fs.readFileSync(contextPath, 'utf8');
  const usesResilientDelivery = contextSource.includes('/api/support-image?role=') && contextSource.includes('role:"coach"') && contextSource.includes('role:"faith"');
  if (!usesResilientDelivery) {
    for (const asset of approvedMarketAssets) {
      if (!contextSource.includes(asset)) failures.push(`HumanContextStrip missing approved market visual: ${asset}`);
    }
  }
}

if (failures.length) {
  console.error('Visual conformance gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Visual conformance gate PASS: scanned ${scannedFiles.length} rendered-code files; rejected athlete/faith assets are absent and approved semantic visuals or governed same-origin delivery are present.`);
