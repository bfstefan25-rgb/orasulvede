import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthModalProvider } from './context/AuthModalContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import InstitutionRoute from './components/InstitutionRoute'
import IOSInstallBanner from './components/IOSInstallBanner'
import ErrorBoundary from './components/ErrorBoundary'

const Landing = lazy(() => import('./pages/Landing'))
const Home = lazy(() => import('./pages/Home'))
const Map = lazy(() => import('./pages/Map'))
const Report = lazy(() => import('./pages/Report'))
const ReportDetail = lazy(() => import('./pages/ReportDetail'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Admin = lazy(() => import('./pages/Admin'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Legal = lazy(() => import('./pages/Legal'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AuthModalProvider>
          <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-900" />}>
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
              <Route path="/dashboard" element={<><Navbar /><InstitutionRoute><ErrorBoundary><Dashboard /></ErrorBoundary></InstitutionRoute></>} />
              <Route path="/legal/:page" element={<Legal />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Suspense>
          <IOSInstallBanner />
        </AuthModalProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App