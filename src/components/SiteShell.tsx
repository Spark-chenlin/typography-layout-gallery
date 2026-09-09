import { Link, NavLink, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { layoutById } from '../content';
import { galleryPositions } from '../navigation';

const positions = new Map<string, number>();

function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prior = useRef(location.pathname);
  useLayoutEffect(() => {
    const saved = positions.get(location.key);
    const gallerySaved = location.state?.restoreGallery ? galleryPositions.get(`${location.pathname}${location.search}${location.hash}`) : undefined;
    if (gallerySaved !== undefined) window.scrollTo(0, gallerySaved);
    else if (navigationType === 'POP' && saved !== undefined) window.scrollTo(0, saved);
    else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else if (prior.current !== location.pathname) window.scrollTo(0, 0);
    if (prior.current !== location.pathname) document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    prior.current = location.pathname;
    const save = () => { positions.set(location.key, window.scrollY); };
    window.addEventListener('scroll', save, { passive: true });
    return () => { window.removeEventListener('scroll', save); };
  }, [location.key, location.pathname, location.hash, navigationType]);
  useEffect(() => {
    history.scrollRestoration = 'manual';
    const item = location.pathname.startsWith('/layouts/') ? layoutById.get(location.pathname.split('/')[2]) : undefined;
    document.title = item ? `${item.id} ${item.nameZh} · 文字版式画廊` : location.pathname === '/about' ? '关于图鉴 · 文字版式画廊' : location.pathname === '/' ? '文字版式画廊 · 字无定式。' : '页面未找到 · 文字版式画廊';
    document.querySelector('meta[name="description"]')?.setAttribute('content', item ? `${item.nameZh}：${item.description}。了解适用场景、使用边界与同类版式。` : '探索 72 种文字版式、8 个分类。从结构样图发现灵感，通过原理与适用场景找到下一种编排。');
  }, [location.pathname]);
  return null;
}

export function SiteShell({ children }: { children: ReactNode }) {
  return <><RouteEffects /><a className="skip" href="#main">跳到主要内容</a>
    <header className="mast"><Link className="mast-brand" to="/">文字版式画廊<span>THE TYPE PANORAMA</span></Link>
      <nav aria-label="主导航"><Link to="/#collection">全部版式 / 72</Link><NavLink className="mast-about" to="/about">图集说明 ↗</NavLink><a className="mast-github" href="https://github.com/Spark-chenlin/typography-layout-gallery" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看文字版式画廊项目（新窗口打开）">GitHub ↗</a></nav>
    </header>
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><Link className="footer-brand" to="/">文字版式画廊</Link>
      <span>72 种文字组织方法 / 8 个分类</span>
      <a className="footer-github" href="https://github.com/Spark-chenlin/typography-layout-gallery" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看文字版式画廊项目（新窗口打开）">GitHub ↗</a>
      <Link className="footer-about" to="/about">关于这份图鉴 ↗</Link>
      <button className="text-button" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>回到顶部 ↑</button>
    </footer>
  </>;
}
