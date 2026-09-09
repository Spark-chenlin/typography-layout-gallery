import { readFile, writeFile } from 'node:fs/promises';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const categories = await readJson('data/categories.json');
const layouts = await readJson('data/layouts.json');
const readme = await readFile('README.md', 'utf8');

const start = '<!-- layout-gallery:start -->';
const end = '<!-- layout-gallery:end -->';
const columns = 4;
const sections = categories.map(category => {
  const items = layouts.filter(layout => layout.categoryId === category.id);
  const rows = [];
  for (let index = 0; index < items.length; index += columns) {
    const cells = items.slice(index, index + columns).map(item => {
      const preview = `public/images/layouts/optimized/${item.id}-360.webp`;
      const source = `public${item.image.src}`;
      return `[![${item.image.alt}](${preview})](${source})<br>**${item.id}** ${item.nameZh}`;
    });
    while (cells.length < columns) cells.push('');
    rows.push(`| ${cells.join(' | ')} |`);
  }
  return [
    `### ${category.id} ${category.name} · ${items.length} 种`,
    '',
    category.description,
    '',
    '|  |  |  |  |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n');
}).join('\n\n');

const gallery = `${start}\n## 72 种版式\n\n点击任意预览图可打开仓库中的 1086 × 1448 高清源 PNG。\n\n${sections}\n${end}`;
let next;
if (readme.includes(start) && readme.includes(end)) {
  next = readme.replace(new RegExp(`${start}[\\s\\S]*?${end}`), gallery);
} else {
  next = readme.replace('\n## 当前状态', `\n\n${gallery}\n\n## 当前状态`);
}
await writeFile('README.md', next, 'utf8');
console.log(`README gallery updated with ${layouts.length} layouts in ${categories.length} categories.`);
