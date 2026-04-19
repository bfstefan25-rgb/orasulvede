import { useEffect } from 'react'

export function useSEO({ title, description, image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Orașul Vede` : 'Orașul Vede — Vezi. Raportează. Schimbă.'
    document.title = fullTitle

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content || '')
    }

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, true)
    }
    setMeta('og:title', fullTitle, true)
    setMeta('og:type', 'website', true)
    setMeta('og:site_name', 'Orașul Vede', true)
    if (image) setMeta('og:image', image, true)
  }, [title, description, image])
}
