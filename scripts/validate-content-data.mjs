import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layouts = JSON.parse(await readFile(path.join(projectRoot, "data", "layouts.json"), "utf8"));
const categories = JSON.parse(await readFile(path.join(projectRoot, "data", "categories.json"), "utf8"));
const errors = [];

if (layouts.length !== 72) errors.push(`Expected 72 layouts, found ${layouts.length}.`);
if (categories.length !== 8) errors.push(`Expected 8 categories, found ${categories.length}.`);

const ids = new Set(layouts.map((layout) => layout.id));
if (ids.size !== layouts.length) errors.push("Layout IDs are not unique.");
const categoryIds = new Set(categories.map((category) => category.id));
if (categoryIds.size !== categories.length) errors.push("Category IDs are not unique.");
const namesZh = new Set();
const namesEn = new Set();

const expectedCounts = { A: 10, B: 10, C: 8, D: 10, E: 8, F: 8, G: 8, H: 10 };
for (const [categoryId, expected] of Object.entries(expectedCounts)) {
  const actual = layouts.filter((layout) => layout.categoryId === categoryId).length;
  if (actual !== expected) errors.push(`${categoryId} expected ${expected}, found ${actual}.`);
  const category = categories.find((item) => item.id === categoryId);
  if (!category) errors.push(`Category ${categoryId} is missing.`);
  else if (category.count !== actual) errors.push(`${categoryId} declares ${category.count}, found ${actual}.`);
}

for (const layout of layouts) {
  if (!categoryIds.has(layout.categoryId)) errors.push(`${layout.id} has unknown category ${layout.categoryId}.`);
  if (!layout.nameZh || layout.nameZh.length < 4 || layout.nameZh.length > 8) errors.push(`${layout.id} needs a 4–8 character Chinese name.`);
  if (namesZh.has(layout.nameZh)) errors.push(`${layout.id} duplicates Chinese name ${layout.nameZh}.`);
  namesZh.add(layout.nameZh);
  if (!layout.nameEn || namesEn.has(layout.nameEn)) errors.push(`${layout.id} has a missing or duplicate English name.`);
  namesEn.add(layout.nameEn);
  if (!layout.description?.trim()) errors.push(`${layout.id} needs a description.`);
  if (layout.keywords.length !== 3) errors.push(`${layout.id} must have exactly 3 keywords.`);
  if (new Set(layout.keywords).size !== layout.keywords.length || layout.keywords.some((value) => !value.trim())) errors.push(`${layout.id} has duplicate or empty keywords.`);
  if (layout.suitableFor.length !== 2) errors.push(`${layout.id} needs exactly 2 suitableFor entries.`);
  if (layout.avoidFor.length !== 2) errors.push(`${layout.id} needs exactly 2 avoidFor entries.`);
  if (layout.relatedIds.length < 2 || layout.relatedIds.length > 4 || new Set(layout.relatedIds).size !== layout.relatedIds.length) errors.push(`${layout.id} needs 2–4 unique related IDs.`);
  if (layout.relatedIds.includes(layout.id)) errors.push(`${layout.id} relates to itself.`);
  for (const relatedId of layout.relatedIds) {
    const related = layouts.find((item) => item.id === relatedId);
    if (!related) errors.push(`${layout.id} references missing related ID ${relatedId}.`);
    else {
      if (related.categoryId !== layout.categoryId) errors.push(`${layout.id} relates across categories to ${relatedId}.`);
      if (!related.relatedIds.includes(layout.id)) errors.push(`${layout.id} and ${relatedId} are not reciprocal.`);
    }
  }

  if (layout.image.width !== 1086 || layout.image.height !== 1448 || layout.image.ratio !== "3:4" || layout.image.format !== "png" || layout.image.opaque !== true) errors.push(`${layout.id} has incorrect declared image metadata.`);
  if (layout.image.alt !== `${layout.id} ${layout.nameZh}版式示例`) errors.push(`${layout.id} has incorrect image alt text.`);

  const localImagePath = path.join(projectRoot, "public", layout.image.src.replace(/^\/images\//, "images/"));
  try {
    await access(localImagePath);
    const png = await readFile(localImagePath);
    const signature = png.subarray(0, 8).toString("hex");
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const colorType = png.readUInt8(25);
    if (signature !== "89504e470d0a1a0a") errors.push(`${layout.id} image is not a PNG.`);
    if (width !== 1086 || height !== 1448) errors.push(`${layout.id} has size ${width}x${height}.`);
    if (colorType === 4 || colorType === 6) errors.push(`${layout.id} PNG contains an alpha channel.`);
  } catch {
    errors.push(`${layout.id} image file is missing.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Content validation passed: 72 layouts, 8 categories, 72 opaque 1086x1448 PNG files.");
}
