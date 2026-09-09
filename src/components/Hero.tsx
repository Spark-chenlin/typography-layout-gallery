import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { layoutById, type Layout } from '../content';
import { LayoutImage } from './LayoutImage';

// The accepted concept's curation order; all content still comes from the JSON.
const chosen = ['D04', 'G01', 'C01', 'E05', 'A04', 'C03', 'A01', 'A03', 'A07', 'A09',
  'B02', 'B04', 'B07', 'B09', 'C02', 'C05', 'C07', 'D01', 'D03', 'D06', 'D09',
  'E01', 'E03', 'E06', 'E08', 'F03', 'F05', 'F07', 'G02', 'G04', 'G06', 'G08', 'H03', 'H05', 'H07']
  .map(id => layoutById.get(id)).filter((item): item is Layout => Boolean(item));

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const manualPause = useRef(paused);

  useEffect(() => {
    const element = track.current!;
    const tileGroup = group.current!;
    const section = hero.current!;
    let visible = true;
    const sync = () => {
      const focused = element.contains(document.activeElement);
      if (manualPause.current || document.hidden || !visible || focused) animation.current?.pause();
      else animation.current?.play();
    };
    const build = () => {
      const old = animation.current;
      const progress = old ? Number(old.currentTime ?? 0) / Number(old.effect?.getTiming().duration) : 0;
      old?.cancel();
      const distance = tileGroup.offsetHeight;
      animation.current = element.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${distance}px)` }],
        { duration: distance / 24 * 1000, iterations: Infinity, easing: 'linear' });
      animation.current.currentTime = (progress % 1) * distance / 24 * 1000;
      sync();
    };
    const resize = new ResizeObserver(build);
    resize.observe(tileGroup);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio > .1; sync(); }, { threshold: [0, .1] });
    intersection.observe(section);
    const focusOut = () => queueMicrotask(sync);
    document.addEventListener('visibilitychange', sync);
    element.addEventListener('focusin', sync);
    element.addEventListener('focusout', focusOut);
    section.addEventListener('motionchange', sync);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => { manualPause.current = preference.matches; setPaused(preference.matches); sync(); };
    preference.addEventListener('change', onPreference);
    return () => {
      resize.disconnect(); intersection.disconnect(); animation.current?.cancel();
      document.removeEventListener('visibilitychange', sync);
      element.removeEventListener('focusin', sync); element.removeEventListener('focusout', focusOut);
      section.removeEventListener('motionchange', sync); preference.removeEventListener('change', onPreference);
    };
  }, []);

  function toggle() {
    manualPause.current = !manualPause.current;
    setPaused(manualPause.current);
    hero.current?.dispatchEvent(new Event('motionchange'));
  }

  return <section className="megascene" aria-labelledby="hero-title" ref={hero}>
    <div className="infinite-angle"><div id="infinite-track" ref={track}>
      {[0, 1].map(copy => <div className="tile-group" key={copy} ref={copy === 0 ? group : undefined} aria-hidden={copy === 1 ? true : undefined}>
        {chosen.map(item => <Link key={item.id} className="poster" to={`/layouts/${item.id}`} state={{ from: '/#collection' }}
          tabIndex={copy ? -1 : 0} aria-label={`查看${item.nameZh}`}>
          <LayoutImage item={item} sizes="(max-width: 760px) 220px, (min-width: 1230px) 22vw, 260px" eager={copy === 0} />
        </Link>)}
      </div>)}
    </div></div>
    <div className="foreground"><div className="front-copy">
      <div className="index-line">72 种版式 <span className="dash" aria-hidden="true" /> 8 个分类</div>
      <h1 id="hero-title">字无定式。</h1>
      <div className="front-bottom"><a className="enter" href="#collection">浏览全部版式 <span aria-hidden="true">↗</span></a>
        <p>探索 72 种文字版式，理解文字如何组织。</p></div>
    </div></div>
    <div className="cycle-toolbar"><span className={`motion-dot ${paused ? 'paused' : ''}`} aria-hidden="true" />
      <button type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? '继续背景自动轮播' : '暂停背景自动轮播'}>{paused ? '继续' : '暂停'}</button>
    </div>
  </section>;
}
