import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useFinanceStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUserId } = useFinanceStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUserId(data.user.id);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (data.user) {
        // If email confirmation is disabled, user is automatically logged in
        if (data.session) {
          setUserId(data.user.id);
          window.location.reload();
        } else {
          // If email confirmation is enabled, show message
          setError('Registro exitoso. Por favor confirma tu email antes de iniciar sesión.');
        }
      }
    } catch (err: any) {
      console.error('Signup error details:', err);
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden relative">
      {/* Desktop: Left Welcome Section - 2/3 width */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex w-2/3 relative overflow-hidden justify-center items-center bg-gradient-to-br from-emerald-600 to-green-700"
      >
        <div className="relative z-10 flex flex-col justify-center items-center w-full max-w-2xl p-12 text-white text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-5xl font-bold mb-4"
          >
            Welcome back!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-emerald-100 text-xl mb-8 leading-relaxed"
          >
            You can sign in to access with your existing account.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Form Section - 1/3 width */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/3 flex items-center justify-center p-6 lg:p-12 relative bg-white"
      >
        {/* Mobile: Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-br from-emerald-600 to-green-700 p-8 text-white text-center rounded-b-[2.5rem] shadow-2xl shadow-emerald-500/20 backdrop-blur-xl border-b border-white/10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30"
          >
            <span className="text-white text-sm font-bold text-center leading-tight">Cuido mi<br />bolsillo</span>
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-emerald-100/80 text-sm">Gestiona tus finanzas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md mt-36 lg:mt-0"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 relative overflow-hidden">
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Sign In
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="text-gray-600 mb-6"
              >
                Access your account
              </motion.p>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Username or email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      className="w-full pl-12 pr-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                >
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      className="w-full pl-12 pr-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focusOutline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex justify-between items-center"
                >
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    Remember me
                  </label>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.05 }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                  >
                    Forgot password?
                  </motion.a>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cargando...' : 'Sign In'}
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <motion.button
                    onClick={handleSignUp}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  >
                    Create an Account
                  </motion.button>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
