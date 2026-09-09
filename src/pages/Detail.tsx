import { Link, useLocation, useParams } from 'react-router-dom';
import { categoryName, filterLayouts, layoutById, layouts } from '../content';
import { LayoutImage } from '../components/LayoutImage';
import { LayoutCard } from '../components/LayoutCard';
import { NotFound } from './NotFound';

export function Detail() {
  const { id } = useParams();
  const item = layoutById.get(id ?? '');
  const location = useLocation();
  const suppliedFrom = location.state?.from;
  const from = typeof suppliedFrom === 'string' && /^\/(?:\?|#|$)/.test(suppliedFrom) ? suppliedFrom : '/#collection';
  if (!item) return <NotFound />;
  const originParams = new URL(from, window.location.origin).searchParams;
  const results = filterLayouts(originParams.get('q') ?? '', originParams.get('category') ?? 'all');
  const sequence = results.some(l => l.id === item.id) ? results : layouts;
  const index = sequence.findIndex(l => l.id === item.id);
  const previous = sequence[(index + sequence.length - 1) % sequence.length];
  const next = sequence[(index + 1) % sequence.length];
  return <article className="detail-page">
    <nav className="detail-top" aria-label="详情操作">
      <Link className="action-button action-primary" to={from} state={{ restoreGallery: true }}>← 返回图库</Link>
      <span className="detail-progress">当前{sequence.length === 72 ? '图鉴' : '结果'} <b>{String(index + 1).padStart(2, '0')}</b> / {sequence.length}</span>
      <div className="detail-stepper">{sequence.length > 1 ? <>
        <Link className="action-button" to={`/layouts/${previous.id}`} state={{ from }} title={previous.nameZh}>← 上一种</Link>
        <Link className="action-button" to={`/layouts/${next.id}`} state={{ from }} title={next.nameZh}>下一种 →</Link>
      </> : <span className="single-result">当前仅 1 个结果</span>}</div>
    </nav>
    <div className="detail-shell">
      <header className="detail-heading">
        <p className="detail-category">{item.id}<span>/</span>{categoryName(item.categoryId)}</p>
        <h1>{item.nameZh}</h1><p className="detail-en">{item.nameEn}</p>
        <p className="detail-description">{item.description}</p>
        <div className="detail-keywords" aria-label="结构特点">{item.keywords.map(k => <span key={k}>{k}</span>)}</div>
      </header>
      <div className="detail-image"><div className="detail-artwork">
        <LayoutImage item={item} sizes="(max-width: 700px) 85vw, 420px" />
      </div></div>
      <div className="detail-copy">
        <section className="detail-section"><h2>适合什么</h2><ul>{item.suitableFor.map(s => <li key={s}>{s}</li>)}</ul></section>
        <section className="detail-section"><h2>留意这些边界</h2><ul>{item.avoidFor.map(s => <li key={s}>{s}</li>)}</ul></section>
        <p className="image-note">样图演示结构，使用时请结合真实内容调整。</p>
      </div>
    </div>
    <section className="related" aria-labelledby="related-title"><div className="related-head"><h2 id="related-title">同类版式</h2>
      <Link className="action-button" to={`/?category=${item.categoryId}#collection`}>浏览这一类 ↗</Link></div>
      <div className="related-grid">{item.relatedIds.map(relatedId => { const related = layoutById.get(relatedId); return related && <LayoutCard key={relatedId} item={related} from={from} />; })}</div>
    </section>
  </article>;
}
