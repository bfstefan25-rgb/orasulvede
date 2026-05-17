import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthModalProvider } from './context/AuthModalContext'
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
import ProtectedRoute from './components/ProtectedRoute'
import IOSInstallBanner from './components/IOSInstallBanner'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AuthModalProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/acasa" element={<><Navbar /><Home /></>} />
            <Route path="/harta" element={<><Navbar /><Map /></>} />
            <Route path="/raport/:id" element={<><Navbar /><ReportDetail /></>} />
            <Route path="/clasament" element={<><Navbar /><Leaderboard /></>} />
            <Route path="/raporteaza" element={<><Navbar /><ProtectedRoute><Report /></ProtectedRoute></>} />
            <Route path="/profil" element={<><Navbar /><ProtectedRoute><Profile /></ProtectedRoute></>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/legal/:page" element={<Legal />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
          <IOSInstallBanner />
        </AuthModalProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App