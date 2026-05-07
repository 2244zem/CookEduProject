/**
 * Login Page — Form login user/admin
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ChefHat } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-terracotta-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-800">Masuk</h1>
          <p className="text-sm text-charcoal-400 mt-1">Selamat datang kembali di MasakYuk</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}
          <Input label="Email" type="email" icon={Mail} placeholder="email@contoh.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" icon={Lock} placeholder="Minimal 6 karakter"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Masuk</Button>
        </form>

        <p className="text-center text-sm text-charcoal-400 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="link">Daftar sekarang</Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 p-3 rounded-lg bg-cream-200/50 border border-cream-300">
          <p className="text-xs text-charcoal-500 font-medium mb-1">Demo Login:</p>
          <p className="text-xs text-charcoal-400">Admin: admin@masakyuk.com / admin123</p>
          <p className="text-xs text-charcoal-400">User: budi@email.com / admin123</p>
        </div>
      </motion.div>
    </div>
  );
}
