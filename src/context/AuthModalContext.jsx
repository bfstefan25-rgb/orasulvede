import { createContext, useContext, useState, useCallback } from 'react'
import AuthModal from '../components/AuthModal'

const AuthModalContext = createContext({})

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [onSuccessCallback, setOnSuccessCallback] = useState(null)

  const openAuthModal = useCallback((onSuccess = null) => {
    setOnSuccessCallback(() => onSuccess)
    setIsOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsOpen(false)
    setOnSuccessCallback(null)
  }, [])

  const handleSuccess = useCallback(() => {
    setIsOpen(false)
    if (onSuccessCallback) onSuccessCallback()
    setOnSuccessCallback(null)
  }, [onSuccessCallback])

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      {isOpen && <AuthModal onClose={closeAuthModal} onSuccess={handleSuccess} />}
    </AuthModalContext.Provider>
  )
}

export const useAuthModal = () => useContext(AuthModalContext)
