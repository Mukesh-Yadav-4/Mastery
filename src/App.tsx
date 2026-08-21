import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './components/dashboard/Dashboard';
import { FocusTimer } from './components/focus/FocusTimer';
import { SessionHistory } from './components/sessions/SessionHistory';
import { Settings } from './components/settings/Settings';
import { MilestoneCelebration } from './components/milestones/MilestoneCelebration';
import { Spinner } from './components/ui/Spinner';

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

/** Shows auth page or authenticated app based on auth state */
function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
}

/** Main app shell with view routing */
function AuthenticatedApp() {
  const { activeView, activeTimer } = useApp();

  // Timer takes over the entire screen
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

/** Renders the correct view based on activeView state */
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
