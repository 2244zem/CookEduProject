/**
 * App.jsx — Root component dengan React Router
 * 
 * Layout:
 * - Public routes: Navbar + Footer membungkus konten
 * - Admin routes: AdminSidebar + AdminTopBar (dikelola per halaman)
 * - Auth routes: Tanpa Navbar/Footer (clean login page)
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './pages/TodoList';
import NotFound from './pages/NotFound';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageRecipes from './pages/admin/ManageRecipes';
import ManageCategories from './pages/admin/ManageCategories';

/**
 * Layout wrapper yang menampilkan Navbar dan Footer
 * hanya di halaman publik (bukan admin/auth).
 */
function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar hanya di halaman publik */}
      {!isAdminRoute && !isAuthRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:slug" element={<RecipeDetail />} />
          <Route path="/todos" element={<TodoList />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/recipes" element={<ManageRecipes />} />
          <Route path="/admin/categories" element={<ManageCategories />} />

          {/* 404 Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer hanya di halaman publik */}
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}
