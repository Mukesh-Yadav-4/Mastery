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
  const { signIn, signUp, error, clearError, loading } = useAuth();
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
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-accent/10 blur-[100px] rounded-full -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Back to Home Button */}
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to home</span>
          </button>
        )}

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-lg mb-3">
            ⚡
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 mb-1.5">
            {mode === 'signin' ? 'Welcome back' : 'Start your journey'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            {mode === 'signin'
              ? 'Continue making your practice measurable.'
              : 'Create an account to track your deliberate practice.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-edge/60 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
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
            <p className="text-xs text-danger text-center py-1 animate-fade-in font-medium">
              {displayError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2 font-semibold shadow-md shadow-accent/20"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
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
