import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useFinanceStore } from '../store';

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
    <div className="min-h-screen bg-gold-500 flex">
      {/* Desktop: Left Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-500 relative overflow-hidden">
        {/* Curved decorative shape */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-tr-full opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-emerald-600 text-3xl font-bold">PF</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-emerald-100 text-xl mb-8 text-center max-w-md">
            Gestiona tus finanzas de manera inteligente y segura
          </p>
          
          <button className="bg-white text-emerald-600 font-bold py-4 px-12 rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            SIGN IN
          </button>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile: Welcome Section */}
        <div className="lg:hidden absolute top-0 left-0 right-0 bg-emerald-500 p-8 text-white text-center rounded-b-[3rem]">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-emerald-600 text-2xl font-bold">PF</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-emerald-100 text-sm">Gestiona tus finanzas</p>
        </div>

        <div className="w-full max-w-md mt-32 lg:mt-0">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-emerald-100">
            <h2 className="text-3xl font-bold text-emerald-900 mb-8 text-center lg:text-left">
              Iniciar Sesión
            </h2>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-emerald-800 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gold-500 border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors text-emerald-900 placeholder-emerald-300"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-800 font-semibold mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gold-500 border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors text-emerald-900 placeholder-emerald-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="text-right">
                <a href="#" className="text-emerald-500 hover:text-emerald-600 font-medium text-sm">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
              >
                {loading ? 'Cargando...' : 'LOG IN'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 mb-4">
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="text-emerald-500 hover:text-emerald-600 font-bold"
                >
                  Regístrate
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
