import { useEffect, useRef, useState, useCallback } from 'react'
import { blogPost } from './data'

const ADX_SCRIPT_URL = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'

let gptScriptLoaded = false
let gptServicesEnabled = false
const definedSlots = new Set()

function loadAdxScript() {
  if (gptScriptLoaded) return

  gptScriptLoaded = true
  window.googletag = window.googletag || { cmd: [] }

  const script = document.createElement('script')
  script.async = true
  script.src = ADX_SCRIPT_URL
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

function enableGptServices() {
  if (gptServicesEnabled || !window.googletag) return

  gptServicesEnabled = true
  window.googletag.cmd.push(() => {
    window.googletag.pubads().enableSingleRequest()
    window.googletag.pubads().collapseEmptyDivs()
    window.googletag.enableServices()
  })
}

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }

    if (description) {
      meta.setAttribute('content', description)
    }
  }, [title, description])
}

function useAdxInit() {
  useEffect(() => {
    loadAdxScript()
  }, [])
}

function getBannerSizeMap(googletag) {
  return googletag
    .sizeMapping()
    .addSize([1200, 0], [[970, 250], [728, 90]])
    .addSize([992, 0], [[728, 90], [468, 60]])
    .addSize([768, 0], [[468, 60], [320, 100]])
    .addSize([480, 0], [[320, 100], [320, 50], [300, 250]])
    .addSize([0, 0], [[320, 100], [320, 50], [300, 250]])
    .build()
}

function getPopupSizeMap(googletag) {
  return googletag
    .sizeMapping()
    .addSize([1024, 0], [[640, 480], [300, 250]])
    .addSize([768, 0], [[640, 480], [320, 240]])
    .addSize([0, 0], [[320, 240], [300, 250]])
    .build()
}

function AdxBanner({ slotId, unitPath }) {
  const renderedRef = useRef(false)
  useAdxInit()

  useEffect(() => {
    if (!window.googletag || !unitPath) return

    window.googletag.cmd.push(() => {
      if (!definedSlots.has(slotId)) {
        const slot = window.googletag
          .defineSlot(
            unitPath,
            [
              [970, 250],
              [728, 90],
              [468, 60],
              [320, 100],
              [320, 50],
              [300, 250],
            ],
            slotId
          )
          ?.defineSizeMapping(getBannerSizeMap(window.googletag))
          ?.addService(window.googletag.pubads())

        if (!slot) return
        definedSlots.add(slotId)
      }

      enableGptServices()

      if (!renderedRef.current) {
        window.googletag.display(slotId)
        renderedRef.current = true
      } else {
        const slots = window.googletag.pubads().getSlots()
        const currentSlot = slots.find((s) => s.getSlotElementId() === slotId)
        if (currentSlot) {
          window.googletag.pubads().refresh([currentSlot])
        }
      }
    })
  }, [slotId, unitPath])

  return (
    <div className="adx-banner-shell">
      <div className="adx-banner-inner">
        <div id={slotId} className="adx-banner-slot" />
      </div>
    </div>
  )
}

function AdxPopupAd({ slotId, unitPath, openCount, visible }) {
  const [loading, setLoading] = useState(true)
  const [instanceKey, setInstanceKey] = useState(0)

  useAdxInit()

  useEffect(() => {
    if (!visible) return
    setLoading(true)
    setInstanceKey((prev) => prev + 1)
  }, [openCount, visible])

  useEffect(() => {
    if (!visible || !window.googletag || !unitPath) return

    const dynamicId = `${slotId}-${instanceKey}`

    const onRender = (event) => {
      if (event.slot?.getSlotElementId() === dynamicId) {
        setLoading(false)
      }
    }

    window.googletag.cmd.push(() => {
      const existingSlots = window.googletag.pubads().getSlots()

      const oldSlot = existingSlots.find((s) => s.getSlotElementId() === dynamicId)
      if (oldSlot) {
        window.googletag.destroySlots([oldSlot])
      }

      const slot = window.googletag
        .defineSlot(
          unitPath,
          [
            [640, 480],
            [320, 240],
            [300, 250],
          ],
          dynamicId
        )
        ?.defineSizeMapping(getPopupSizeMap(window.googletag))
        ?.addService(window.googletag.pubads())

      if (!slot) return

      enableGptServices()

      window.googletag.pubads().addEventListener('slotRenderEnded', onRender)
      window.googletag.display(dynamicId)
      window.googletag.pubads().refresh([slot])
    })

    return () => {
      if (window.googletag?.pubads) {
        try {
          window.googletag.pubads().removeEventListener('slotRenderEnded', onRender)
        } catch (e) {}
      }
    }
  }, [instanceKey, visible, unitPath, slotId])

  return (
    <div className="adx-popup-shell">
      {loading && <div className="adx-popup-loader">Loading advertisement…</div>}
      <div className="adx-popup-frame">
        <div id={`${slotId}-${instanceKey}`} className="adx-popup-slot" />
      </div>
    </div>
  )
}

const adxBanners = [
  {
    slotId: 'gpt-passback-16619',
    unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_300x250_16619_240326',
  },
  {
    slotId: 'gpt-passback-16397',
    unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_336x280_16397_140226',
  },
  {
    slotId: 'gpt-passback-16596',
    unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_300x250_16596_200326',
  },
]

const interstitialConfig = {
  slotId: 'gpt-passback-16595',
  unitPath: '/229445249,23315340101/highR_RS88_PikaShow_552_640x480_16595_200326',
}

function App() {
  usePageMeta(blogPost.seoTitle, blogPost.seoDescription)

  const [clickCount, setClickCount] = useState(0)
  const [popupOpenCount, setPopupOpenCount] = useState(0)
  const [interstitialVisible, setInterstitialVisible] = useState(false)

  const closeInterstitial = useCallback(() => {
    setInterstitialVisible(false)
  }, [])

  const handlePageClick = useCallback((event) => {
    if (
      event.target.closest(
        '.adx-banner-slot, .adx-popup-slot, .interstitial-content, .interstitial-close'
      )
    ) {
      return
    }

    setClickCount((current) => {
      const next = current + 1

      if (next % 3 === 0) {
        setPopupOpenCount((count) => count + 1)
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
              <button
                className="interstitial-close"
                onClick={closeInterstitial}
                aria-label="Close advertisement"
              >
                ×
              </button>

              <div className="interstitial-header">Advertisement</div>

              <AdxPopupAd
                {...interstitialConfig}
                openCount={popupOpenCount}
                visible={interstitialVisible}
              />

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