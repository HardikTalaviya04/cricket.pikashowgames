import { useEffect, useRef, useState, useCallback } from 'react'
import { blogPost } from './data'

const ADX_SCRIPT_URL = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
let gptScriptLoaded = false
let gptServicesEnabled = false

function loadAdxScript() {
  if (gptScriptLoaded) {
    return
  }

  gptScriptLoaded = true
  window.googletag = window.googletag || { cmd: [] }

  const script = document.createElement('script')
  script.async = true
  script.src = ADX_SCRIPT_URL
  document.head.appendChild(script)
}

function enableGptServices() {
  if (gptServicesEnabled || !window.googletag) {
    return
  }

  gptServicesEnabled = true
  window.googletag.cmd.push(() => {
    window.googletag.pubads().enableSingleRequest()
    window.googletag.enableServices()
  })
}

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title

    const meta = document.querySelector('meta[name="description"]')
    if (meta && description) {
      meta.setAttribute('content', description)
    }
  }, [title, description])
}

function useAdxInit() {
  useEffect(() => {
    loadAdxScript()
  }, [])
}

function AdxBanner({ slotId, unitPath, sizes }) {
  const slotInitialized = useRef(false)
  useAdxInit()

  useEffect(() => {
    if (!window.googletag || slotInitialized.current || !unitPath) {
      return
    }

    window.googletag.cmd.push(() => {
      window.googletag.defineSlot(unitPath, sizes, slotId).addService(window.googletag.pubads())
      enableGptServices()
      window.googletag.display(slotId)
      slotInitialized.current = true
    })
  }, [slotId, unitPath, sizes])

  return <div id={slotId} className="adx-ad-slot" style={{ minHeight: '90px', width: '100%' }} />
}

function AdxInterstitial({ slotId, unitPath, trigger }) {
  const slotInitialized = useRef(false)
  useAdxInit()

  useEffect(() => {
    if (!window.googletag || !unitPath || !trigger) {
      return
    }

    window.googletag.cmd.push(() => {
      if (!slotInitialized.current) {
        window.googletag.defineOutOfPageSlot(unitPath, slotId).addService(window.googletag.pubads())
        enableGptServices()
        slotInitialized.current = true
      }

      window.googletag.display(slotId)
    })
  }, [slotId, unitPath, trigger])

  return <div id={slotId} className="adx-interstitial-slot" />
}

const adxBanners = [
  {
    slotId: 'gpt-passback-16619',
    unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_300x250_16619_240326',
    sizes: [[728, 90], [320, 50], [300, 250]],
  },
  {
    slotId: 'gpt-passback-16397',
    unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_336x280_16397_140226',
    sizes: [[728, 90], [320, 50], [300, 250]],
  },
  {
    slotId: 'gpt-passback-16596',
    unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_300x250_16596_200326',
    sizes: [[728, 90], [320, 50], [300, 250]],
  },
]

const interstitialConfig = {
  slotId: 'gpt-passback-16595',
  unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_640x480_16595_200326',
}

function App() {
  usePageMeta(blogPost.seoTitle, blogPost.seoDescription)

  const [clickCount, setClickCount] = useState(0)
  const [interstitialTrigger, setInterstitialTrigger] = useState(0)
  const [interstitialVisible, setInterstitialVisible] = useState(false)

  const closeInterstitial = useCallback(() => {
    setInterstitialVisible(false)
  }, [])

  const handlePageClick = useCallback((event) => {
    if (event.target.closest('.adx-ad-slot, .adx-interstitial-slot, .interstitial-content, .interstitial-close')) {
      return
    }

    setClickCount((current) => {
      const next = current + 1
      if (next % 3 === 0) {
        setInterstitialTrigger((value) => value + 1)
        setInterstitialVisible(true)
      }
      return next
    })
  }, [])

  return (
    <div className="page-shell" onClick={handlePageClick}>
      <header className="hero">
        <h1>{blogPost.hero.title}</h1>
        <div className="adx-ad-wrap">
          <div className="adx-ad-card">
            <div className="adx-ad-label">Advertisement</div>
            <AdxBanner {...adxBanners[0]} />
          </div>
        </div>
        <p className="hero-summary">{blogPost.hero.summary}</p>
        <div className="feature-card-stack" aria-label="Featured image cards">
          {blogPost.featuredCards.map((card) => (
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
        {interstitialVisible && (
          <div className="interstitial-overlay">
            <div className="interstitial-content">
              <button className="interstitial-close" onClick={closeInterstitial} aria-label="Close advertisement">
                ×
              </button>
              <div className="interstitial-header">Advertisement</div>
              <AdxInterstitial {...interstitialConfig} trigger={interstitialTrigger} />
              <div className="interstitial-footer">Tap the close button to continue</div>
            </div>
          </div>
        )}

        <section className="article-section article-intro">
          <div className="adx-ad-wrap">
            <div className="adx-ad-card">
              <div className="adx-ad-label">Advertisement</div>
              <AdxBanner {...adxBanners[1]} />
            </div>
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
        <div className="adx-ad-wrap">
          <div className="adx-ad-card">
            <div className="adx-ad-label">Advertisement</div>
            <AdxBanner {...adxBanners[2]} />
          </div>
        </div>

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
