import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { openAuthModal } = useAuthModal()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      openAuthModal(() => {}) // on success stay on page — auth state change will re-render
      navigate('/acasa', { replace: true })
    }
  }, [user, loading])

  if (loading) return null
  if (!user) return null

  return children
}
