import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function InstitutionRoute({ children }) {
  const { user, loading, role, roleLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading || roleLoading) return
    if (!user || role !== 'institution_admin') {
      navigate('/acasa', { replace: true })
    }
  }, [user, loading, role, roleLoading])

  if (loading || roleLoading) return null
  if (!user || role !== 'institution_admin') return null

  return children
}
