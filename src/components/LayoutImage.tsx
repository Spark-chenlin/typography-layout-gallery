import { useEffect, useRef, useState } from 'react';
import type { Layout } from '../content';

export function LayoutImage({ item, sizes = '(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 24vw', eager = false, deferUntilNear = false }: {
  item: Layout; sizes?: string; eager?: boolean; deferUntilNear?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [nearViewport, setNearViewport] = useState(!deferUntilNear);
  const [loaded, setLoaded] = useState(false);
  const loadTarget = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!deferUntilNear || nearViewport) return;
    if (!('IntersectionObserver' in window)) {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: '220px 120px' });
    if (loadTarget.current) observer.observe(loadTarget.current);
    return () => observer.disconnect();
  }, [deferUntilNear, nearViewport]);

  const productionFallback = `/images/layouts/optimized/${item.id}-1086.webp`;
  const loadingState = deferUntilNear ? `hero-layout-image${nearViewport ? ' is-near' : ''}${loaded ? ' is-loaded' : ''}` : undefined;
  const image = <picture>
    {nearViewport && !failed && <source type="image/webp" sizes={sizes}
      srcSet={[360, 480, 720, 1086].map(w => `/images/layouts/optimized/${item.id}-${w}.webp ${w}w`).join(', ')} />}
    {nearViewport && <img src={productionFallback} width={item.image.width} height={item.image.height}
      alt={item.image.alt} loading={eager || deferUntilNear ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
  </picture>;
  if (!deferUntilNear) return image;
  return <span ref={loadTarget} className={loadingState}>
    <span className="hero-loading-paper" aria-hidden="true">
      <span className="hero-loading-id">{item.id}</span>
      <span className="hero-loading-lines"><i /><i /></span>
      <span className="hero-loading-status">IMAGE / LOADING</span>
    </span>
    {image}
    <span className="hero-loading-scan" aria-hidden="true" />
  </span>;
}
