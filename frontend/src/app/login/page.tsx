'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Loader, Toast } from '@/components/ui';
import { api, saveSession } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  
  // Hydration protection state
  const [isMounted, setIsMounted] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Error & Feedback states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const [submitting, setSubmitting] = useState(false);

  // Mark component mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-dismiss toast timer
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Mode switcher with state cleanup
  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setEmailError('');
    setPasswordError('');
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    }

    return valid;
  };

  const handleSuccess = (message: string) => {
    setToastVariant('success');
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let response: { access_token?: string; token?: string; user?: any };

      if (mode === 'login') {
        // Pass single object payload matching api.ts signature & FastAPI requirement
        response = await api.auth.login({ email, password });
      } else {
        response = await api.auth.register({
          email,
          password,
          name: name || email.split('@')[0],
        });
      }

      const token = response.access_token || response.token || 'session_active';
      const userData = response.user || { email, name: name || email.split('@')[0] };

      // Persist session
      saveSession(token, userData);

      handleSuccess(
        mode === 'login'
          ? 'Login successful! Redirecting to dashboard...'
          : 'Account created! Redirecting to dashboard...'
      );
    } catch (err) {
      setToastVariant('error');
      setToastMessage(err instanceof Error ? err.message : 'Authentication failed');
      setToastVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent SSR/Hydration flickering
  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading security features..." size="md" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'login' ? 'Sign in to EcoStay' : 'Join EcoStay Explorer'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access your dashboard, reservations, and sustainability rewards.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            error={emailError}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="w-full justify-center bg-emerald-700 hover:bg-emerald-800"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader size="sm" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login' ? (
            <>
              New to EcoStay?{' '}
              <button
                type="button"
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                onClick={() => handleToggleMode('register')}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                onClick={() => handleToggleMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link href="/about" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Learn about our mission
          </Link>
        </p>
      </div>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </main>
  );
}