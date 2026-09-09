import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const sourceImageDirectory = path.resolve('dist', 'images', 'layouts');
const entries = await readdir(sourceImageDirectory, { withFileTypes: true });
const sourcePngs = entries.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.png'));

await Promise.all(sourcePngs.map(entry => rm(path.join(sourceImageDirectory, entry.name))));
await rm(path.resolve('dist', '_redirects'), { force: true });
console.log(`Removed ${sourcePngs.length} source PNG files and the Pages-only redirect file from the deploy bundle.`);
