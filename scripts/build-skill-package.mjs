import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const skill = path.join(root, 'skills', 'typography-layout-advisor');
const references = path.join(skill, 'references');
const assets = path.join(skill, 'assets', 'layouts');
const categories = JSON.parse(await readFile(path.join(root, 'data', 'categories.json'), 'utf8'));
const layouts = JSON.parse(await readFile(path.join(root, 'data', 'layouts.json'), 'utf8'));

await mkdir(references, { recursive: true });
await mkdir(assets, { recursive: true });
await copyFile(path.join(root, 'data', 'categories.json'), path.join(references, 'categories.json'));
await copyFile(path.join(root, 'data', 'layouts.json'), path.join(references, 'layouts.json'));

const cues = {
  A: '内容多、需要连续阅读、查找、比较或理解层级时使用。',
  B: '先决定整页重心、分区、围合关系或留白结构时使用。',
  C: '标题需要成为主视觉，并通过尺度、裁切、错位或跨栏建立冲击时使用。',
  D: '阅读方向需要沿路径运动，或需要明显的引导、循环和动势时使用。',
  E: '通过重复单元建立节奏、秩序、渐变或异常焦点时使用。',
  F: '文字需要与图片、主体轮廓、负形或标注系统共同构图时使用。',
  G: '涉及中文传统格式、横竖关系、夹注、诗词或中外文对照时使用。',
  H: '表达实验性高于常规阅读，需要拼贴、解构、透视或空间错视时使用。',
};

const categoryLines = [
  '# 分类与选型',
  '',
  '| 类别 | 名称 | 数量 | 主要判断 |',
  '|---|---|---:|---|',
  ...categories.map(category => `| ${category.id} | ${category.name} | ${category.count} | ${cues[category.id]} |`),
  '',
  '先按内容任务定位类别，再用关键词、适用场景和使用边界缩小到具体编号。需要强视觉时仍要保留最低阅读顺序；需要长文阅读时，不要因为样图醒目而选择高实验性的结构。',
];
await writeFile(path.join(references, 'categories.md'), `${categoryLines.join('\n')}\n`, 'utf8');

const catalog = ['# 72 种文字版式完整目录', '', '图片内文字只作视觉示例；以下结构化信息为选择依据。'];
for (const category of categories) {
  catalog.push('', `## ${category.id} ${category.name}`, '', category.description);
  for (const layout of layouts.filter(item => item.categoryId === category.id)) {
    catalog.push(
      '',
      `### ${layout.id} ${layout.nameZh} / ${layout.nameEn}`,
      '',
      `![${layout.image.alt}](../assets/layouts/${layout.id}.webp)`,
      '',
      `- 原理：${layout.description}`,
      `- 特征：${layout.keywords.join(' / ')}`,
      `- 适合：${layout.suitableFor.join('；')}`,
      `- 避免：${layout.avoidFor.join('；')}`,
      `- 同类版式：${layout.relatedIds.join(' / ')}`,
    );
    await copyFile(
      path.join(root, 'public', 'images', 'layouts', 'optimized', `${layout.id}-360.webp`),
      path.join(assets, `${layout.id}.webp`),
    );
  }
}
await writeFile(path.join(references, 'catalog.md'), `${catalog.join('\n')}\n`, 'utf8');
console.log(`Built typography-layout-advisor with ${layouts.length} layouts, ${categories.length} categories and ${layouts.length} previews.`);
