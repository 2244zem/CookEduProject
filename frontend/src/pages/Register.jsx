/**
 * Register Page — Form registrasi user baru
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ChefHat } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Gagal mendaftar. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-terracotta-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-800">Daftar</h1>
          <p className="text-sm text-charcoal-400 mt-1">Buat akun MasakYuk gratis</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}
          <Input label="Nama Lengkap" icon={User} placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" icon={Mail} placeholder="email@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" icon={Lock} placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Daftar</Button>
        </form>
        <p className="text-center text-sm text-charcoal-400 mt-6">
          Sudah punya akun? <Link to="/login" className="link">Masuk</Link>
        </p>
      </motion.div>
    </div>
  );
}
