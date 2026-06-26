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
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-green-500 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"
      />

      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left Welcome Section */}
          <div className="lg:w-1/2 bg-gradient-to-br from-emerald-600 to-green-700 p-8 lg:p-12 flex flex-col justify-center items-center text-white text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-6 relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-emerald-400/30 rounded-3xl"
              />
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 backdrop-blur-xl border border-white/20 overflow-hidden">
                <img src="/logo-login.png" alt="Cuido mi bolsillo" className="w-full h-full object-contain" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-3xl lg:text-4xl font-bold mb-3"
            >
              ¡Bienvenido de nuevo!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-emerald-100 text-base lg:text-lg mb-6 leading-relaxed"
            >
              Puedes iniciar sesión para acceder con tu cuenta existente.
            </motion.p>
          </div>

          {/* Right Form Section */}
          <div className="lg:w-1/2 p-8 lg:p-12 bg-white relative">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <img src="/logo-login.png" alt="Watermark" className="w-48 h-48 object-contain" />
            </div>
            
            <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Iniciar Sesión
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="text-gray-600 mb-6"
            >
              Accede a tu cuenta
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
                  Usuario o email
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
                  Contraseña
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
                  Recordarme
                </label>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  ¿Olvidaste tu contraseña?
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
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600">
                ¿No tienes una cuenta?{' '}
                <motion.button
                  onClick={handleSignUp}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                >
                  Crear cuenta
                </motion.button>
              </p>
            </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
