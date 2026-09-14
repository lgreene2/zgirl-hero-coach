import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const APP = join(ROOT, "app");
const EXCLUDED = new Set([
  // Historical/internal reviewer evidence must retain exact candidate lineage.
  "app/review/ReviewerWorkspace.tsx",
  // The mature v3.14.1 Coach implementation stays byte-stable for release-train
  // verification. A shared runtime normalizer removes its obsolete public badge.
  "app/coach/page.tsx",
  "app/coach/CoachExperience.tsx",
]);

const FORBIDDEN = [
  "Z-Girl Open v2.2",
  "Z-Girl Open v2.2.1",
  "HERO WITHIN v2.2",
  "HERO WITHIN v2.2.1",
  "v2.2 public experience",
  "v2.2.1 public experience",
];

async function walk(dir) {
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) files.push(...await walk(full));
    else if (/\.(tsx?|jsx?|mdx?)$/.test(entry)) files.push(full);
  }
  return files;
}

const violations = [];
for (const file of await walk(APP)) {
  const rel = relative(ROOT, file).split(sep).join("/");
  if (EXCLUDED.has(rel)) continue;
  const text = await readFile(file, "utf8");
  for (const marker of FORBIDDEN) {
    if (text.includes(marker)) violations.push(`${rel}: ${marker}`);
  }
}

if (violations.length) {
  console.error("Stale public Z-Girl version labels found:\n" + violations.map((v) => `- ${v}`).join("\n"));
  process.exit(1);
}

console.log("Public version-label gate passed: no obsolete v2.2/v2.2.1 product labels on current public routes.");
