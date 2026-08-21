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
import { Spinner } from './components/ui/Spinner';

type PublicRoute = 'landing' | 'signin' | 'signup';

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
  const [publicRoute, setPublicRoute] = useState<PublicRoute>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('signup') || hash.includes('register') || path === '/signup') {
        return 'signup';
      }
      if (hash.includes('signin') || hash.includes('login') || path === '/login') {
        return 'signin';
      }
    }
    return 'landing';
  });

  // Listen to hash changes / browser back & forward buttons
  useEffect(() => {
    function handleLocationChange() {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash.includes('signup') || hash.includes('register') || path === '/signup') {
        setPublicRoute('signup');
      } else if (hash.includes('signin') || hash.includes('login') || path === '/login') {
        setPublicRoute('signin');
      } else {
        setPublicRoute('landing');
      }
    }

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = useCallback((route: PublicRoute) => {
    setPublicRoute(route);
    if (route === 'signin') {
      window.history.pushState(null, '', '#/login');
    } else if (route === 'signup') {
      window.history.pushState(null, '', '#/signup');
    } else {
      window.history.pushState(null, '', '#/');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <Spinner size="lg" />
      </div>
    );
  }

  // 1. Authenticated User Flow
  if (user) {
    return (
      <AppProvider>
        <AuthenticatedApp />
      </AppProvider>
    );
  }

  // 2. Unauthenticated Visitor Flow (Public Landing vs Auth)
  if (publicRoute === 'signin') {
    return (
      <AuthPage
        initialMode="signin"
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  if (publicRoute === 'signup') {
    return (
      <AuthPage
        initialMode="signup"
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  return (
    <LandingPage
      onSignIn={() => navigateTo('signin')}
      onSignUp={() => navigateTo('signup')}
    />
  );
}

/** Main app shell with view routing */
function AuthenticatedApp() {
  const { activeView, activeTimer } = useApp();

  // Timer takes over the entire screen for distraction-free focus
  if (activeTimer) {
    return (
      <>
        <FocusTimer />
        <MilestoneCelebration />
      </>
    );
  }

  return (
    <AppShell>
      <ViewRouter activeView={activeView} />
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
