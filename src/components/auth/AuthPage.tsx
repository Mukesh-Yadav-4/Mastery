import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onNavigateHome?: () => void;
}

export function AuthPage({ initialMode = 'signin', onNavigateHome }: AuthPageProps) {
  const { signIn, signUp, resetPassword, demoSignIn, error, clearError, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
    setLocalError(null);
  }

  function toggleMode() {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setLocalError(null);
    clearError();
    setConfirmPassword('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      signUp(email, password);
    } else {
      signIn(email, password);
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-canvas relative">
      {/* Background Glow */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(129,140,248,0.12),rgba(0,0,0,0))] -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-sm rounded-2xl bg-surface border border-edge p-6 sm:p-8 shadow-xl">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to home</span>
          </button>
        )}

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent mb-3 shadow-inner">
            <span className="text-lg">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'signin'
              ? 'Continue making your practice measurable.'
              : 'Begin tracking your deliberate practice hours.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />

          {mode === 'signup' ? (
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          ) : null}

          {displayError ? (
            <div className="space-y-2 py-1 animate-fade-in text-center">
              <p className="text-xs text-danger font-medium">{displayError}</p>
              {mode === 'signin' && email.includes('@') && password.length >= 6 && (
                <button
                  type="button"
                  onClick={() => resetPassword(email, password)}
                  className="text-xs text-accent hover:underline font-semibold block mx-auto cursor-pointer"
                >
                  🔑 Set password & Sign in as {email}
                </button>
              )}
              {mode === 'signup' && displayError.includes('already exists') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setLocalError(null);
                    clearError();
                  }}
                  className="text-xs text-accent hover:underline font-semibold block mx-auto cursor-pointer"
                >
                  👉 Switch to Sign in
                </button>
              )}
            </div>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2 font-semibold shadow-md shadow-accent/20 cursor-pointer"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>

          {/* 1-Click Quick Enter for Instant Access */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-edge/60 w-full" />
            <span className="bg-surface px-2 text-[10px] text-zinc-500 uppercase tracking-widest absolute">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={demoSignIn}
            className="w-full font-semibold text-xs text-zinc-200 hover:text-white border-edge/60 hover:border-accent/60 shadow-sm cursor-pointer transition-all"
          >
            ⚡ Instant 1-Click Demo Access
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          {mode === 'signin' ? (
            <>
              New to Mastery?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-accent hover:text-indigo-400 font-medium transition-colors cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-accent hover:text-indigo-400 font-medium transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
