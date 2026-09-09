import layoutData from '../data/layouts.json';
import categoryData from '../data/categories.json';

export const layouts = layoutData;
export const categories = categoryData;
export type Layout = (typeof layouts)[number];
export const layoutById = new Map(layouts.map(item => [item.id, item]));
export const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '';

export function filterLayouts(query: string, category: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return layouts.filter(item => (category === 'all' || item.categoryId === category) &&
    terms.every(term => [item.id, item.nameZh, item.nameEn, item.description,
      ...item.keywords, ...item.suitableFor, ...item.avoidFor].join(' ').toLocaleLowerCase().includes(term)));
}
