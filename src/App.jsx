import { useEffect, useRef } from 'react'
import { blogPost } from './data'

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title

    const meta = document.querySelector('meta[name="description"]')
    if (meta && description) {
      meta.setAttribute('content', description)
    }
  }, [title, description])
}

function AdBanner({ slot }) {
  const adRef = useRef(null)
  const hasPushedRef = useRef(false)

  useEffect(() => {
    if (hasPushedRef.current || !adRef.current) {
      return
    }

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      hasPushedRef.current = true
    } catch (error) {
      console.error('AdSense error', error)
    }
  }, [])

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-3018701002720211"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

function loadGptScript() {
  if (document.querySelector('script[src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"]')) {
    return
  }

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
  document.head.appendChild(script)
}

function GptAdSlot({ divId, slotPath, size }) {
  useEffect(() => {
    window.googletag = window.googletag || { cmd: [] }
    window.googletag.cmd.push(function () {
      window.googletag.defineSlot(slotPath, size, divId).addService(window.googletag.pubads())
      window.googletag.pubads().set('page_url', 'https://www.pikashowgames.com/')
      window.googletag.enableServices()
      window.googletag.display(divId)
    })

    loadGptScript()
  }, [divId, slotPath, size])

  return <div id={divId} className="gpt-ad-slot" />
}

function App() {
  usePageMeta(blogPost.seoTitle, blogPost.seoDescription)

  return (
    <div className="page-shell">

      <header className="hero">
        <h1>{blogPost.hero.title}</h1>
        <div className="hero-ad-wrap">
          <GptAdSlot
            divId="gpt-passback-16595"
            slotPath="/229445249,23315340101/highR_RS88_PikaShow_552_640x480_16595_200326"
            size={[640, 480]}
          />
        </div>
        <p className="hero-summary">{blogPost.hero.summary}</p>
        <div className="feature-card-stack" aria-label="Featured image cards">
          {blogPost.featuredCards.map((card, index) => (
            <div key={card.title}>
              <section className="feature-card">
                <div className="feature-card-image-wrap">
                  <img src={card.image} alt={card.title} className="feature-card-image" />
                </div>

                <div className="feature-card-body">
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                  <p className="feature-card-note">{card.note}</p>
                </div>
              </section>
            </div>
          ))}
        </div>
      </header>

      <main className="article-flow">
        <section className="article-section article-intro">
           <div className="hero-ad-wrap">
          <GptAdSlot
            divId="gpt-passback-16397"
            slotPath="/229445249,23315340101/highR_RS88_PikaShow_552_336x280_16397_140226"
            size={[336,280]}
          />
        </div>
          {blogPost.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="article-section">
          <p className="section-kicker">Quick Tips</p>
          <h2>A few things worth checking before the match starts</h2>
          <div className="quick-facts-grid">
            {blogPost.quickFacts.map((fact) => (
              <article className="quick-fact" key={fact.title}>
                <h3>{fact.title}</h3>
                <p>{fact.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="article-section">
          <p className="section-kicker">Step By Step</p>
          <h2>{blogPost.stepsTitle}</h2>
          <ol className="steps-flow">
            {blogPost.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {blogPost.sections.map((section) => (
          <section className="article-section" key={section.heading}>
            <p className="section-kicker">{section.kicker}</p>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section className="article-section">
          <p className="section-kicker">Where To Watch</p>
          <h2>{blogPost.examplesTitle}</h2>
          <div className="simple-list">
            {blogPost.examples.map((item) => (
              <article className="simple-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="article-section">
          <p className="section-kicker">FAQ</p>
          <h2>{blogPost.faqTitle}</h2>
          <div className="faq-flow">
            {blogPost.faq.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="article-section notes-section">
          <p className="section-kicker">Important Notes</p>
          <h2>{blogPost.notesTitle}</h2>
          <ul className="notes-list">
            {blogPost.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <section className="article-section notes-section">
          {blogPost.disclosures.map((item) => (
            <article className="disclosure-block" key={item.title}>
              <h2>{item.title}</h2>
              {item.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
