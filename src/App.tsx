import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './components/dashboard/Dashboard';
import { FocusTimer } from './components/focus/FocusTimer';
import { SessionHistory } from './components/sessions/SessionHistory';
import { Settings } from './components/settings/Settings';
import { MilestoneCelebration } from './components/milestones/MilestoneCelebration';
import { SessionCompletionModal } from './components/sessions/SessionCompletionModal';
import { Spinner } from './components/ui/Spinner';

type AppRoute = 'app' | 'landing' | 'signin' | 'signup';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

/** Determines whether to show public landing/auth or authenticated app */
function AppRouter() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('signup') || hash.includes('register') || path === '/signup') {
        return 'signup';
      }
      if (hash.includes('signin') || hash.includes('login') || path === '/login') {
        return 'signin';
      }
      if (hash.includes('landing') || hash.includes('about')) {
        return 'landing';
      }
      if (hash.includes('app')) {
        return 'app';
      }
    }
    return user ? 'app' : 'landing';
  });

  // Listen to hash changes / browser back & forward buttons
  useEffect(() => {
    function handleLocationChange() {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash.includes('signup') || hash.includes('register') || path === '/signup') {
        setRoute('signup');
      } else if (hash.includes('signin') || hash.includes('login') || path === '/login') {
        setRoute('signin');
      } else if (hash.includes('landing') || hash.includes('about')) {
        setRoute('landing');
      } else if (hash.includes('app')) {
        setRoute('app');
      } else {
        setRoute(user ? 'app' : 'landing');
      }
    }

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [user]);

  const navigateTo = useCallback((newRoute: AppRoute) => {
    setRoute(newRoute);
    if (newRoute === 'signin') {
      window.history.pushState(null, '', '#/login');
    } else if (newRoute === 'signup') {
      window.history.pushState(null, '', '#/signup');
    } else if (newRoute === 'landing') {
      window.history.pushState(null, '', '#/landing');
    } else {
      window.history.pushState(null, '', '#/app');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <Spinner size="lg" />
      </div>
    );
  }

  // 1. Explicit Landing Page View (accessible to both visitors and logged-in users)
  if (route === 'landing' || (!user && route !== 'signin' && route !== 'signup')) {
    return (
      <LandingPage
        onSignIn={() => (user ? navigateTo('app') : navigateTo('signin'))}
        onSignUp={() => (user ? navigateTo('app') : navigateTo('signup'))}
      />
    );
  }

  // 2. Auth Flow (Sign In)
  if (route === 'signin') {
    if (user) {
      return (
        <AppProvider>
          <AuthenticatedApp onNavigateLanding={() => navigateTo('landing')} />
        </AppProvider>
      );
    }
    return (
      <AuthPage
        initialMode="signin"
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  // 3. Auth Flow (Sign Up)
  if (route === 'signup') {
    if (user) {
      return (
        <AppProvider>
          <AuthenticatedApp onNavigateLanding={() => navigateTo('landing')} />
        </AppProvider>
      );
    }
    return (
      <AuthPage
        initialMode="signup"
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  // 4. Authenticated Application
  if (user) {
    return (
      <AppProvider>
        <AuthenticatedApp onNavigateLanding={() => navigateTo('landing')} />
      </AppProvider>
    );
  }

  // Fallback to landing
  return (
    <LandingPage
      onSignIn={() => navigateTo('signin')}
      onSignUp={() => navigateTo('signup')}
    />
  );
}

/** Main app shell with view routing */
function AuthenticatedApp({ onNavigateLanding }: { onNavigateLanding: () => void }) {
  const { activeView, activeTimer, sessionReward, dismissSessionReward } = useApp();

  // Timer takes over the entire screen for distraction-free focus
  if (activeTimer) {
    return (
      <>
        <FocusTimer />
        <SessionCompletionModal
          reward={sessionReward}
          onDismiss={dismissSessionReward}
        />
        <MilestoneCelebration />
      </>
    );
  }

  return (
    <AppShell onNavigateLanding={onNavigateLanding}>
      <ViewRouter activeView={activeView} />
      <SessionCompletionModal
        reward={sessionReward}
        onDismiss={dismissSessionReward}
      />
      <MilestoneCelebration />
    </AppShell>
  );
}

/** Renders the correct in-app view based on activeView state */
function ViewRouter({ activeView }: { activeView: string }) {
  switch (activeView) {
    case 'dashboard':
      return <Dashboard />;
    case 'history':
      return <SessionHistory />;
    case 'settings':
      return <Settings />;
    default:
      return <Dashboard />;
  }
}

export default App;
