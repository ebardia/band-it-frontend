'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-5 border-2 border-brass">
        {/* Logo + Tagline */}
        <div className="text-center mb-4">
          <Image
            src="/assets/logo.png"
            alt="BAND IT"
            width={320}
            height={85}
            className="mx-auto"
            priority
          />
          <p className="font-display font-bold text-3xl tracking-wide -mt-14" style={{
            color: '#A00000',
            textShadow: '0 0 10px rgba(160, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Collective Power
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-brown mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-warm-gray/30 rounded-lg focus:ring-2 focus:ring-brass focus:border-brass outline-none transition bg-cream/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-brown mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-warm-gray/30 rounded-lg focus:ring-2 focus:ring-brass focus:border-brass outline-none transition bg-cream/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rust to-brass text-white py-2 rounded-lg font-bold text-sm hover:shadow-xl disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-3 text-center text-xs space-y-1">
          <p className="text-warm-gray">
            <Link href="/register" className="text-rust hover:text-brass font-semibold">Sign up</Link>
            {' • '}
            <Link href="/forgot-password" className="text-warm-gray hover:text-brown">Forgot password?</Link>
          </p>
        </div>

        {/* Test Accounts - Compact */}
        <div className="mt-3 pt-3 border-t border-brass/30">
          <div className="text-xs text-brown bg-cream/50 p-2 rounded space-y-0.5">
            <p>📧 bob@test.com / testpass123</p>
            <p>📧 sarah@test.com / testpass123</p>
          </div>
        </div>
      </div>
    </div>
  );
}