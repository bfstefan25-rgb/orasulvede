import { useState } from 'react'
import { Send, Trophy, ArrowRight, X } from 'lucide-react'

const STEPS = [
  {
    logo: true,
    title: 'Bun venit în Orașul Vede!',
    description: 'Platforma care conectează cetățenii cu autoritățile locale. Împreună facem orașul mai bun, raport cu raport.',
  },
  {
    icon: Send,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
    title: 'Raportează o problemă',
    description: 'Fotografiază problema, adaugă o descriere și locația. Raportul tău ajunge direct la autorități și la comunitate.',
  },
  {
    icon: Trophy,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    title: 'Câștigă puncte și urcă în clasament',
    description: 'Fiecare raport îți aduce puncte. Cu cât raportezi mai mult, cu atât urci în clasament și câștigi badge-uri exclusive.',
  },
]

export default function Onboarding({ onDone, userId }) {
  const [step, setStep] = useState(0)

  function finish() {
    if (userId) localStorage.setItem(`onboarding_done_${userId}`, '1')
    onDone()
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">

        {/* Skip button */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-primary-600'
                  : i < step
                    ? 'w-1.5 bg-primary-300'
                    : 'w-1.5 bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Icon / Logo */}
        {current.logo ? (
          <div className="flex justify-center mb-5">
            <img src="/ovlogo-icon.png" alt="Orașul Vede" className="h-20 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </div>
        ) : (
          <div className={`w-16 h-16 ${current.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
            <current.icon size={32} className={current.iconColor} />
          </div>
        )}

        {/* Text */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-8">
          {current.description}
        </p>

        {/* Buttons */}
        <button
          onClick={() => isLast ? finish() : setStep(s => s + 1)}
          className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {isLast ? 'Începe acum' : 'Continuă'}
          <ArrowRight size={16} />
        </button>

        {!isLast && (
          <button onClick={finish} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors py-1">
            Sari peste
          </button>
        )}
      </div>
    </div>
  )
}
