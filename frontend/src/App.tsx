import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore } from './store'
import SplashScreen from './components/layout/SplashScreen'
import Onboarding from './components/layout/Onboarding'
import { useDeviceProfile } from './hooks/useDeviceProfile'

const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const UserLayout = lazy(() => import('./components/layout/UserLayout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const RecipeList = lazy(() => import('./pages/user/RecipeList'))
const RecipeDetail = lazy(() => import('./pages/user/RecipeDetail'))
const Learning = lazy(() => import('./pages/user/Learning'))
const CookingMode = lazy(() => import('./pages/user/CookingMode'))
const Profile = lazy(() => import('./pages/user/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const RecipesCRUD = lazy(() => import('./pages/admin/RecipesCRUD'))
const LessonsManager = lazy(() => import('./pages/admin/LessonsManager'))
const AuditLog = lazy(() => import('./pages/admin/AuditLog'))
const Stats = lazy(() => import('./pages/user/Stats'))
const FridgeScanner = lazy(() => import('./pages/user/FridgeScanner'))
const CatatanIbu = lazy(() => import('./pages/user/CatatanIbu'))
const DaftarBelanja = lazy(() => import('./pages/user/DaftarBelanja'))
const AiAssistant = lazy(() => import('./pages/user/AiAssistant'))
const SmartWeatherDashboard = lazy(() => import('./pages/SmartWeatherDashboard'))
const CookShare = lazy(() => import('./pages/user/CookShare'))

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 text-slate-700">
      <div className="h-10 w-10 rounded-2xl border-4 border-sky-200 border-t-sky-600 animate-spin" />
    </div>
  )
}

export default function App() {
  const { isAuthenticated, isAdmin } = useAuthStore()
  const { isDarkMode } = useThemeStore()
  const { shouldReduceMotion } = useDeviceProfile()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('hasSeenOnboarding') !== 'true'
  })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const splashDuration = shouldReduceMotion ? 900 : 1700
    const timer = setTimeout(() => setShowSplash(false), splashDuration)
    return () => clearTimeout(timer)
  }, [shouldReduceMotion])

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
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
        className="min-h-screen"
      >
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}
