import { Link } from 'react-router-dom';
import { categories } from '../content';

export function About() {
  return <article className="about-page">
    <Link className="back-link" to="/#collection">← 返回图库</Link>
    <header className="about-intro"><p className="about-number">72 / 08</p><h1>理解文字，<br />如何组织。</h1>
      <p>一份关于文字空间的参考图鉴。<br />从看见一种编排，到理解它为什么成立。</p></header>
    <section className="about-section"><h2>从形式，找到方法。</h2><div><p>文字版式画廊收录 72 种文字组织方法，按 8 个一级分类编排。你可以从样图发现构图，通过分类或搜索找到方向，再进入详情判断它是否适合你的内容。</p>
      <p>这里关注的是信息如何分区、阅读如何流动、大小如何建立层级，以及文字与空间如何配合。字体风格与文字特效不作为独立版式收录。</p></div></section>
    <section className="about-section"><h2>八种观察角度。</h2><div className="category-directory">{categories.map(c => <Link to={`/?category=${c.id}#collection`} key={c.id}>
      <span className="directory-id">{c.id}</span><div><h3>{c.name}</h3><p>{c.description}</p></div><span>{c.count} ↗</span>
    </Link>)}</div></section>
    <section className="about-section"><h2>如何使用这份图鉴。</h2><div><p>先明确内容量、阅读顺序和表达强度，再比较版式的适用场景与边界。样图提供结构启发，具体使用时仍需根据真实文字重新安排字号、间距与比例。</p>
      <p>样图为 AI 生成的视觉示例，在统一视觉条件下展示编排机制。名称、原理、适合与不适合场景以页面上的文字说明为准。这是一套便于学习和比较的分类，并非唯一或绝对完整的学术标准。</p>
      <Link className="enter" to="/#collection">开始探索版式 <span aria-hidden="true">↗</span></Link></div></section>
  </article>;
}
