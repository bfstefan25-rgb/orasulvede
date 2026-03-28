import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Map from './pages/Map'
import Report from './pages/Report'
import ReportDetail from './pages/ReportDetail'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public pages - no navbar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App pages - with navbar */}
        <Route path="/acasa" element={<><Navbar /><Home /></>} />
        <Route path="/harta" element={<><Navbar /><Map /></>} />
        <Route path="/raporteaza" element={<><Navbar /><Report /></>} />
        <Route path="/raport/:id" element={<><Navbar /><ReportDetail /></>} />
        <Route path="/clasament" element={<><Navbar /><Leaderboard /></>} />
        <Route path="/profil" element={<><Navbar /><Profile /></>} />
      </Routes>
    </AuthProvider>
  )
}

export default App