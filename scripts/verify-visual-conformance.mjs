import fs from 'node:fs';

const heroPath = new URL('../components/CommercialHumanHero.tsx', import.meta.url);
const source = fs.readFileSync(heroPath, 'utf8');

const requiredVariants = ['athlete', 'faith', 'institution', 'family', 'partner'];
const forbiddenAssets = [
  'photo-1517466787929-bc90951d0974', // rejected: isolated soccer action did not communicate coach-athlete support
  'photo-1520857014576-2c4f4c972b57', // retired: generic community visual did not clearly communicate faith/values conversation
];

const requiredPhrases = [
  'semanticIntent:',
  'sourceNote:',
  'data-semantic-intent=',
  'photo-1768349027535-da4842dab8ba',
  'photo-1651514645933-c26e0eb4ace3',
];

const failures = [];
for (const variant of requiredVariants) {
  if (!source.includes(`${variant}: {`)) failures.push(`Missing governed visual variant: ${variant}`);
}
for (const asset of forbiddenAssets) {
  if (source.includes(asset)) failures.push(`Rejected visual asset reintroduced: ${asset}`);
}
for (const phrase of requiredPhrases) {
  if (!source.includes(phrase)) failures.push(`Missing visual-conformance marker: ${phrase}`);
}

if (failures.length) {
  console.error('Visual conformance gate FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Visual conformance gate PASS: market-lane visuals carry semantic intent and rejected assets remain blocked.');
