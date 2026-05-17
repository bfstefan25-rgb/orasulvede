import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

function isIosSafari() {
  const ua = window.navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  const isStandalone = window.navigator.standalone === true
  return isIos && isSafari && !isStandalone
}

export default function IOSInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissedThisSession = sessionStorage.getItem('iosBannerDismissed')
    if (!dismissedThisSession && isIosSafari()) {
      setTimeout(() => setVisible(true), 2000)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    sessionStorage.setItem('iosBannerDismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[300] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3 animate-in slide-in-from-bottom">
      {/* Icon */}
      <div className="h-10 overflow-hidden flex-shrink-0 mt-0.5" style={{ width: '29px' }}>
        <img src="/ovlogo.png" alt="logo" className="h-10 w-auto max-w-none" style={{ mixBlendMode: 'multiply' }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
          Instalează Orașul Vede
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Apasă{' '}
          <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-[11px] font-bold mx-0.5">
            ↑
          </span>
          {' '}apoi <strong className="text-gray-700 dark:text-gray-200">„Adaugă pe ecran principal"</strong>
        </p>
      </div>

      {/* Close */}
      <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
        <X size={18} />
      </button>
    </div>
  )
}
