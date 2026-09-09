import { useState } from 'react';
import type { Layout } from '../content';

export function LayoutImage({ item, sizes = '(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 24vw', eager = false }: {
  item: Layout; sizes?: string; eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const productionFallback = `/images/layouts/optimized/${item.id}-1086.webp`;
  return <picture>
    {!failed && <source type="image/webp" sizes={sizes}
      srcSet={[360, 720, 1086].map(w => `/images/layouts/optimized/${item.id}-${w}.webp ${w}w`).join(', ')} />}
    <img src={productionFallback} width={item.image.width} height={item.image.height}
      alt={item.image.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
  </picture>;
}
