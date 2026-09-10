import { useEffect, useRef, useState } from 'react';
import type { Layout } from '../content';

export function LayoutImage({ item, sizes = '(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 24vw', eager = false, deferUntilNear = false }: {
  item: Layout; sizes?: string; eager?: boolean; deferUntilNear?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [nearViewport, setNearViewport] = useState(!deferUntilNear);
  const picture = useRef<HTMLPictureElement>(null);

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
    if (picture.current) observer.observe(picture.current);
    return () => observer.disconnect();
  }, [deferUntilNear, nearViewport]);

  const productionFallback = `/images/layouts/optimized/${item.id}-1086.webp`;
  return <picture ref={picture}>
    {nearViewport && !failed && <source type="image/webp" sizes={sizes}
      srcSet={[360, 480, 720, 1086].map(w => `/images/layouts/optimized/${item.id}-${w}.webp ${w}w`).join(', ')} />}
    {nearViewport && <img src={productionFallback} width={item.image.width} height={item.image.height}
      alt={item.image.alt} loading={eager || deferUntilNear ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />}
  </picture>;
}
