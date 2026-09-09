import { Link } from 'react-router-dom';

export function NotFound() {
  return <section className="not-found"><span className="empty-index">404</span><h1>这一页，暂时留白。</h1><p>没有找到这个地址对应的页面，回到图库继续探索吧。</p><Link className="enter" to="/#collection">返回完整图库 <span aria-hidden="true">↗</span></Link></section>;
}
