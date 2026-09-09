import { useSearchParams } from 'react-router-dom';
import { categories, filterLayouts } from '../content';
import { Hero } from '../components/Hero';
import { LayoutCard } from '../components/LayoutCard';

export function Gallery() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const requestedCategory = params.get('category');
  const category = categories.some(c => c.id === requestedCategory) ? requestedCategory! : 'all';
  const filtered = filterLayouts(query, category);
  const current = categories.find(c => c.id === category);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value && value !== 'all') next.set(key, value); else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
    document.querySelector('#collection')?.scrollIntoView();
  }
  const clear = () => { setParams({}, { replace: true }); document.querySelector('#collection')?.scrollIntoView(); };
  const active = query !== '' || category !== 'all';
  return <><Hero /><section className="explore" id="collection" aria-labelledby="collection-title">
    <div className="explore-head"><div><span className="explore-kicker">THE COMPLETE COLLECTION</span>
      <h2 id="collection-title">找到你的下一种编排。</h2></div><p>从结构出发，找到适合你的文字表达。</p></div>
    <div className="collection-tools">
      <div className="filter-search-row">
        <div className="explore-search"><label className="sr-only" htmlFor="search">搜索版式</label>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m15 15 6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
          <input id="search" type="search" placeholder="搜索版式名称、关键词或使用场景" value={query} onChange={e => update('q', e.target.value)} />
        </div>
        <span className="result-total" role="status">共 <b>{filtered.length}</b> 种版式</span>
        {active && <button className="filter-clear" onClick={clear}>清除筛选 ×</button>}
      </div>
      <nav className="explore-categories" aria-label="版式分类">
        <button aria-pressed={category === 'all'} onClick={() => update('category', 'all')}>全部版式 <span>72</span></button>
        {categories.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => update('category', c.id)}>
          {c.id} {c.name} <span>{c.count}</span>
        </button>)}
      </nav>
      <label className="mobile-category" htmlFor="category-select"><span>分类</span><select id="category-select" value={category} onChange={e => update('category', e.target.value)}>
        <option value="all">全部版式 · 72</option>{categories.map(c => <option key={c.id} value={c.id}>{c.id} {c.name} · {c.count}</option>)}
      </select></label>
    </div>
    <div className="collection-context"><span>{current?.name ?? '全部版式'} · {filtered.length} 种</span><span>{current?.description ?? '点击任一图版，查看结构与使用建议。'}</span></div>
    {filtered.length ? <div className="gallery-grid">{filtered.map(item => <LayoutCard key={item.id} item={item} />)}</div>
      : <div className="empty-state"><span className="empty-index">00</span><h3>暂时没有找到对应版式。</h3>
        <p>试试「圆环」「双语」或「海报」，也可以清除筛选，重新看看。</p>
        <button className="enter" onClick={clear}>查看全部版式 <span aria-hidden="true">↗</span></button></div>}
  </section></>;
}
