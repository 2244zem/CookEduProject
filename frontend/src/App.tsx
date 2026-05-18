import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore } from './store'
import AdminLayout from './components/layout/AdminLayout'
import UserLayout from './components/layout/UserLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import RecipeList from './pages/user/RecipeList'
import RecipeDetail from './pages/user/RecipeDetail'
import Learning from './pages/user/Learning'
import CookingMode from './pages/user/CookingMode'
import Profile from './pages/user/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import RecipesCRUD from './pages/admin/RecipesCRUD'
import LessonsManager from './pages/admin/LessonsManager'
import AuditLog from './pages/admin/AuditLog'
import Stats from './pages/user/Stats'
import FridgeScanner from './pages/user/FridgeScanner'
import SplashScreen from './components/layout/SplashScreen'
import Onboarding from './components/layout/Onboarding'
import CatatanIbu from './pages/user/CatatanIbu'
import DaftarBelanja from './pages/user/DaftarBelanja'
import AiAssistant from './pages/user/AiAssistant'
import SmartWeatherDashboard from './pages/SmartWeatherDashboard'
import CookShare from './pages/user/CookShare'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { isAuthenticated, isAdmin } = useAuthStore()
  const { isDarkMode } = useThemeStore()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('hasSeenOnboarding') !== 'true'
  })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isAuthenticated && isAdmin && location.pathname === '/') {
      navigate('/admin')
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  if (showSplash) return <SplashScreen />

  const handleCompleteOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShowOnboarding(false)
  }

  if (showOnboarding) return <Onboarding onComplete={handleCompleteOnboarding} />

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="min-h-screen"
      >
        <Routes location={location}>
          {/* Auth Pages */}
          <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin' : '/'} /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="recipes" element={<RecipesCRUD />} />
            <Route path="lessons" element={<LessonsManager />} />
            <Route path="audit-logs" element={<AuditLog />} />
          </Route>

          {/* User Routes - All Protected by requirement */}
          <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route index element={<RecipeList />} />
            <Route path="recipes/:id" element={<RecipeDetail />} />
            <Route path="learning" element={<Learning />} />
            <Route path="stats" element={<Stats />} />
            <Route path="fridge" element={<FridgeScanner />} />
            <Route path="profile" element={<Profile />} />
            <Route path="catatan-ibu" element={<CatatanIbu />} />
            <Route path="daftar-belanja" element={<DaftarBelanja />} />
            <Route path="ai-assistant" element={<AiAssistant />} />
            <Route path="cookshare" element={<CookShare />} />
          </Route>

          {/* Smart Weather Recipe App Dual-View Dashboard */}
          <Route path="/smart-weather" element={<ProtectedRoute><SmartWeatherDashboard /></ProtectedRoute>} />

          {/* Cooking Mode (fullscreen, no layout) */}
          <Route path="/cook/:id" element={<ProtectedRoute><CookingMode /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
