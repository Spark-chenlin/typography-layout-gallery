import { Link, useLocation } from 'react-router-dom';
import { categoryName, type Layout } from '../content';
import { LayoutImage } from './LayoutImage';
import { galleryPositions } from '../navigation';

export function LayoutCard({ item, from }: { item: Layout; from?: string }) {
  const location = useLocation();
  const returnTo = from ?? `${location.pathname}${location.search}#collection`;
  return <Link className="layout-card" to={`/layouts/${item.id}`} state={{ from: returnTo }}
    aria-label={`查看${item.nameZh}`} onClick={() => { if (location.pathname === '/') galleryPositions.set(returnTo, scrollY); }}>
    <span className="image-wrap"><LayoutImage item={item} /></span>
    <span className="card-meta"><span className="card-id">{item.id}</span><span className="card-category">{categoryName(item.categoryId)}</span></span>
    <h3>{item.nameZh}</h3>
    <span className="card-keywords">{item.keywords.map(word => <span key={word}>{word}</span>)}</span>
    <span className="card-open">查看详情 <span aria-hidden="true">↗</span></span>
  </Link>;
}
