import sharp from 'sharp';
import { readFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layouts = JSON.parse(await readFile(path.join(root, 'data/layouts.json'), 'utf8'));
const output = path.join(root, 'public/images/layouts/optimized');
const widths = [360, 480, 720, 1086];
await mkdir(output, { recursive: true });
let bytes = 0;
for (const layout of layouts) {
  const source = path.join(root, 'public', layout.image.src);
  for (const width of widths) {
    const target = path.join(output, `${layout.id}-${width}.webp`);
    const sourceStat = await stat(source);
    const targetStat = await stat(target).catch(() => null);
    if (!targetStat || targetStat.mtimeMs < sourceStat.mtimeMs) {
      await sharp(source).resize({ width }).webp({ quality: 85 }).toFile(target);
    }
    bytes += (await stat(target)).size;
  }
}
console.log(`Generated ${layouts.length * widths.length} responsive WebP files: ${(bytes / 1024 / 1024).toFixed(2)} MiB.`);
