import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Map from './pages/Map'
import Report from './pages/Report'
import ReportDetail from './pages/ReportDetail'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Legal from './pages/Legal'
import ResetPassword from './pages/ResetPassword'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/acasa" element={<><Navbar /><Home /></>} />
          <Route path="/harta" element={<><Navbar /><Map /></>} />
          <Route path="/raporteaza" element={<><Navbar /><Report /></>} />
          <Route path="/raport/:id" element={<><Navbar /><ReportDetail /></>} />
          <Route path="/clasament" element={<><Navbar /><Leaderboard /></>} />
          <Route path="/profil" element={<><Navbar /><Profile /></>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/legal/:page" element={<Legal />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App