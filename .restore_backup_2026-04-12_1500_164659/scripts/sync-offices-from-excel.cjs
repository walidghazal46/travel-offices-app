const fs = require("fs");
const path = require("path");
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

const licenseToNumber = (value) => {
  const n = Number(String(value || "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const src = fs.readFileSync(appPath, "utf8");
const marker = "const officesData = [";
const start = src.indexOf(marker);
if (start < 0) {
  console.error("officesData block not found in App.jsx");
  process.exit(1);
}

const openIndex = src.indexOf("[", start);
let depth = 0;
let endIndex = -1;
for (let i = openIndex; i < src.length; i++) {
  const ch = src[i];
  if (ch === "[") depth += 1;
  if (ch === "]") {
    depth -= 1;
    if (depth === 0) {
      endIndex = i;
      break;
    }
  }
}

if (endIndex < 0) {
  console.error("Failed to locate end of officesData array");
  process.exit(1);
}

const arrayBody = src.slice(openIndex + 1, endIndex);
const objectRegex = /\{[^{}]*?id:\s*\d+[^{}]*?\}/gs;
const existingObjects = Array.from(arrayBody.matchAll(objectRegex)).map((m) => m[0]);

const extractField = (objText, fieldName) => {
  const match = objText.match(new RegExp(`${fieldName}:\\s*(?:\"([^\"]*)\"|'([^']*)'|([^,}]+))`));
  if (!match) return "";
  return String(match[1] || match[2] || match[3] || "").trim();
};

const existing = [];
const existingLicenses = [];
for (const objText of existingObjects) {
  const id = Number(extractField(objText, "id"));
  const name = extractField(objText, "name");
  const gov = extractField(objText, "gov");
  const address = extractField(objText, "address");
  const license = licenseToNumber(extractField(objText, "license"));
  if (license > 0) existingLicenses.push(license);
  if (!name || !gov || !license) continue;
  existing.push({
    id,
    name,
    gov,
    address,
    license,
    key: `${normalizeText(gov)}|${normalizeText(name)}|${license}`,
  });
}

const existingKeySet = new Set(existing.map((e) => e.key));
let nextId = Math.max(0, ...existingLicenses, ...existing.map((e) => e.id || 0)) + 1;

const wb = xlsx.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

const additions = [];
let skippedAddressDifferences = 0;

for (const row of rows) {
  const name = String(row["اسم الشركة"] || "").trim();
  const gov = String(row["المحافظة"] || "").trim();
  const address = String(row["العنوان"] || "").trim();
  const license = licenseToNumber(row["رقم الترخيص"]);

  if (!name || !gov || !license) continue;

  const key = `${normalizeText(gov)}|${normalizeText(name)}|${license}`;

  if (existingKeySet.has(key)) {
    const found = existing.find((e) => e.key === key);
    if (found && normalizeText(found.address) !== normalizeText(address) && address) {
      skippedAddressDifferences += 1;
    }
    continue;
  }

  existingKeySet.add(key);
  additions.push({
    id: nextId++,
    name,
    license,
    address,
    gov,
    phone: "",
  });
}

console.log(`Rows in Excel: ${rows.length}`);
console.log(`New offices by [gov+name+license]: ${additions.length}`);
console.log(`Address diffs ignored on existing matches: ${skippedAddressDifferences}`);

if (additions.length > 0) {
  console.log(`Sample new licenses: ${additions.slice(0, 20).map((x) => x.license).join(", ")}`);
}

if (!apply) {
  console.log("Dry run only. Add --apply to write changes.");
  process.exit(0);
}

if (additions.length === 0) {
  console.log("No changes written.");
  process.exit(0);
}

const lines = additions.map((o) =>
  `  { id: ${o.id}, name: ${JSON.stringify(o.name)}, license: ${o.license}, address: ${JSON.stringify(o.address)}, gov: ${JSON.stringify(o.gov)}, phone: \"\" },`
);

const updated = src.slice(0, endIndex) + "\n" + lines.join("\n") + "\n" + src.slice(endIndex);
fs.writeFileSync(appPath, updated, "utf8");

console.log(`Applied: added ${additions.length} offices to officesData.`);
