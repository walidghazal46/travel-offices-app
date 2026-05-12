const fs = require("fs");
const path = require("path");
const vm = require("vm");
const xlsx = require("xlsx");

const args = process.argv.slice(2);
const argValue = (flag, fallback = "") => {
  const idx = args.indexOf(flag);
  if (idx === -1) return fallback;
  const value = args[idx + 1];
  if (!value || value.startsWith("--")) return fallback;
  return value;
};

const apply = args.includes("--apply");
const appPath = path.resolve(argValue("--app", "src/App.jsx"));
const excelPath = path.resolve(argValue("--excel", "companies_data0.xlsx"));
const reportArg = argValue("--report", "");
const reportPath = reportArg ? path.resolve(reportArg) : "";

if (!fs.existsSync(appPath)) {
  console.error(`App file not found: ${appPath}`);
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error(`Excel file not found: ${excelPath}`);
  process.exit(1);
}

const normalizeText = (value) => String(value || "")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const normalizeArabic = (value) => normalizeText(value)
  .replace(/[أإآ]/g, "ا")
  .replace(/ى/g, "ي")
  .replace(/ة/g, "ه")
  .replace(/ؤ/g, "و")
  .replace(/ئ/g, "ي")
  .replace(/\(.*?\)/g, " ")
  .replace(/[^\u0600-\u06FF0-9a-z ]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const licenseToNumber = (value) => {
  const n = Number(String(value || "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const compareArabic = (a, b) => String(a || "").localeCompare(String(b || ""), "ar");

const locateBlock = (sourceText, marker, openChar, closeChar) => {
  const start = sourceText.indexOf(marker);
  if (start < 0) return null;
  const openIndex = sourceText.indexOf(openChar, start);
  if (openIndex < 0) return null;
  let depth = 0;
  let endIndex = -1;
  for (let i = openIndex; i < sourceText.length; i += 1) {
    const ch = sourceText[i];
    if (ch === openChar) depth += 1;
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }
  if (endIndex < 0) return null;
  let statementEnd = endIndex + 1;
  while (statementEnd < sourceText.length && /\s/.test(sourceText[statementEnd])) statementEnd += 1;
  if (sourceText[statementEnd] === ";") statementEnd += 1;
  return { start, openIndex, endIndex, statementEnd };
};

const scoreCandidate = (candidate, target) => {
  let score = 0;
  if (normalizeText(candidate.gov) === normalizeText(target.gov)) score += 5;

  const candidateName = normalizeArabic(candidate.name);
  const targetName = normalizeArabic(target.name);
  if (candidateName === targetName) {
    score += 5;
  } else if (candidateName && targetName && (candidateName.includes(targetName) || targetName.includes(candidateName))) {
    score += 3;
  }

  const candidateAddress = normalizeArabic(candidate.address);
  const targetAddress = normalizeArabic(target.address);
  if (candidateAddress === targetAddress) {
    score += 4;
  } else if (candidateAddress && targetAddress && (candidateAddress.includes(targetAddress) || targetAddress.includes(candidateAddress))) {
    score += 2;
  }

  return score;
};

const choosePreservedId = (candidates, target) => {
  const scored = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, target) }))
    .sort((a, b) => b.score - a.score || a.candidate.id - b.candidate.id);

  const safeMatches = scored.filter((entry) => entry.score >= 10);
  if (safeMatches.length > 0) {
    return safeMatches.slice().sort((a, b) => a.candidate.id - b.candidate.id)[0].candidate;
  }

  return scored[0]?.candidate || candidates[0] || null;
};

const formatOfficeEntry = (office) => `  { id: ${office.id}, name: ${JSON.stringify(office.name)}, license: ${office.license}, address: ${JSON.stringify(office.address)}, gov: ${JSON.stringify(office.gov)}, phone: ${JSON.stringify(office.phone || "")} },`;

const formatAliasEntry = ([fromId, toId]) => `  ${fromId}: ${toId},`;

const src = fs.readFileSync(appPath, "utf8");
const officesMarker = "const officesData = [";
const officesBlock = locateBlock(src, officesMarker, "[", "]");
if (!officesBlock) {
  console.error("officesData block not found in App.jsx");
  process.exit(1);
}

const aliasesMarker = "const officeIdAliases = {";
const existingAliasesBlock = locateBlock(src, aliasesMarker, "{", "}");
const existingAliases = existingAliasesBlock
  ? vm.runInNewContext(`(${src.slice(existingAliasesBlock.openIndex, existingAliasesBlock.endIndex + 1)})`)
  : {};

const existing = vm.runInNewContext(src.slice(officesBlock.openIndex, officesBlock.endIndex + 1));
const byLicense = new Map();
for (const office of existing) {
  const license = licenseToNumber(office?.license);
  if (!license) continue;
  if (!byLicense.has(license)) byLicense.set(license, []);
  byLicense.get(license).push({
    id: Number(office?.id) || 0,
    name: String(office?.name || "").trim(),
    gov: String(office?.gov || "").trim(),
    address: String(office?.address || "").trim(),
    license,
    phone: String(office?.phone || "").trim(),
  });
}

const wb = xlsx.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

const rebuiltOffices = [];
const aliasEntries = [];
const chosenIds = new Set();
const conflictReport = [];
let preservedIds = 0;
let reassignedIds = 0;
let unresolvedLicenses = 0;

for (const row of rows) {
  const name = String(row["اسم الشركة"] || "").trim();
  const gov = String(row["المحافظة"] || "").trim();
  const address = String(row["العنوان"] || "").trim();
  const license = licenseToNumber(row["رقم الترخيص"]);
  if (!name || !gov || !address || !license) continue;

  const candidates = byLicense.get(license) || [];
  const chosen = choosePreservedId(candidates, { name, gov, address, license });
  if (!chosen) {
    unresolvedLicenses += 1;
    continue;
  }

  if (chosenIds.has(chosen.id)) {
    console.error(`Duplicate canonical id selection detected for license ${license} and id ${chosen.id}`);
    process.exit(1);
  }

  chosenIds.add(chosen.id);
  rebuiltOffices.push({
    id: chosen.id,
    name,
    license,
    address,
    gov,
    phone: chosen.phone || "",
  });

  if (candidates.some((candidate) => candidate.id !== chosen.id)) {
    reassignedIds += 1;
  } else {
    preservedIds += 1;
  }

  if (candidates.length > 1) {
    conflictReport.push({
      license,
      target: { name, gov, address },
      chosen: {
        id: chosen.id,
        name: chosen.name,
        gov: chosen.gov,
        address: chosen.address,
        score: scoreCandidate(chosen, { name, gov, address, license }),
      },
      replaced: candidates
        .filter((candidate) => candidate.id !== chosen.id)
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          gov: candidate.gov,
          address: candidate.address,
          score: scoreCandidate(candidate, { name, gov, address, license }),
        }))
        .sort((a, b) => b.score - a.score || a.id - b.id),
    });
  }

  for (const candidate of candidates) {
    if (candidate.id !== chosen.id) {
      aliasEntries.push([candidate.id, chosen.id]);
    }
  }
}

rebuiltOffices.sort((a, b) => compareArabic(a.gov, b.gov) || a.license - b.license || a.id - b.id);
const mergedAliasMap = new Map(
  Object.entries(existingAliases || {}).map(([fromId, toId]) => [Number(fromId) || 0, Number(toId) || 0]).filter(([fromId, toId]) => fromId && toId),
);
for (const [fromId, toId] of aliasEntries) {
  mergedAliasMap.set(fromId, toId);
}
const mergedAliasEntries = Array.from(mergedAliasMap.entries()).sort((a, b) => a[0] - b[0]);
conflictReport.sort((a, b) => a.license - b.license);
const removedCount = existing.length - rebuiltOffices.length;

const reportPayload = {
  generatedAt: new Date().toISOString(),
  excelPath: path.relative(process.cwd(), excelPath),
  appPath: path.relative(process.cwd(), appPath),
  summary: {
    excelAuthorityRows: rows.length,
    currentAppOffices: existing.length,
    rebuiltAuthoritativeOffices: rebuiltOffices.length,
    removedDuplicatedOrConflictingOffices: removedCount,
    newLegacyAliasesGenerated: aliasEntries.length,
    trackedLegacyAliases: mergedAliasEntries.length,
    fullyPreservedSingleSourceIds: preservedIds,
    licensesResolvedFromCompetingRows: reassignedIds,
    unresolvedExcelLicenses: unresolvedLicenses,
  },
  conflictResolutions: conflictReport,
  legacyAliases: mergedAliasEntries.map(([fromId, toId]) => ({ fromId, toId })),
};

console.log(`Excel authority rows: ${rows.length}`);
console.log(`Current app offices: ${existing.length}`);
console.log(`Rebuilt authoritative offices: ${rebuiltOffices.length}`);
console.log(`Removed duplicated/conflicting offices: ${removedCount}`);
console.log(`New legacy id aliases generated: ${aliasEntries.length}`);
console.log(`Tracked legacy id aliases: ${mergedAliasEntries.length}`);
console.log(`Fully preserved single-source ids: ${preservedIds}`);
console.log(`Licenses resolved from competing current rows: ${reassignedIds}`);
if (unresolvedLicenses > 0) {
  console.log(`Unresolved Excel licenses: ${unresolvedLicenses}`);
}

if (reportPath) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(reportPayload, null, 2)}\n`, "utf8");
  console.log(`Report written: ${path.relative(process.cwd(), reportPath)}`);
}

if (!apply) {
  console.log("Dry run only. Add --apply to write authoritative rebuild.");
  process.exit(0);
}

const officesReplacement = `const officesData = [\n${rebuiltOffices.map(formatOfficeEntry).join("\n")}\n];`;
const aliasesReplacement = `const officeIdAliases = {\n${mergedAliasEntries.map(formatAliasEntry).join("\n")}\n};`;

let updated = `${src.slice(0, officesBlock.start)}${officesReplacement}${src.slice(officesBlock.statementEnd)}`;

const aliasesBlock = locateBlock(updated, aliasesMarker, "{", "}");
if (aliasesBlock) {
  updated = `${updated.slice(0, aliasesBlock.start)}${aliasesReplacement}${updated.slice(aliasesBlock.statementEnd)}`;
} else {
  const insertAt = updated.indexOf(officesReplacement) + officesReplacement.length + 1;
  updated = `${updated.slice(0, insertAt)}${aliasesReplacement}\n${updated.slice(insertAt)}`;
}

fs.writeFileSync(appPath, updated, "utf8");

console.log(`Applied: rebuilt officesData with ${rebuiltOffices.length} authoritative offices.`);
console.log(`Applied: wrote ${aliasEntries.length} legacy office id aliases.`);
