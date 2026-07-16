import { useState, useEffect, useCallback } from 'react'
import translations from './i18n'

const LANGS = ['en', 'fr', 'ar']
const STORAGE_KEY = 'sona-lang'

function getInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && LANGS.includes(saved)) return saved
  } catch {}
  const browser = navigator.language.slice(0, 2)
  if (LANGS.includes(browser)) return browser
  return 'en'
}

export function useLang() {
  const [lang, setLangState] = useState(getInitial)

  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((key, vars) => {
    let str = translations[lang]?.[key] || translations.en[key] || key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }, [lang])

  return { lang, setLang, t, isRtl: lang === 'ar' }
}
