import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { LogOut, LayoutDashboard, History, User, Compass } from 'lucide-react';
import type { ActiveView } from '../../types';

interface NavItem {
  view: ActiveView;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { view: 'history', label: 'History', icon: History },
  { view: 'settings', label: 'Profile', icon: User },
];

export function AppShell({
  children,
  onNavigateLanding,
}: {
  children: React.ReactNode;
  onNavigateLanding?: () => void;
}) {
  const { signOut } = useAuth();
  const { activeView, setActiveView, activeTimer } = useApp();

  // Hide shell when timer is active (immersive mode)
  if (activeTimer) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-canvas">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 h-14 border-b border-edge/50 bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            title="View Landing Page & Philosophy"
          >
            <span className="text-accent text-sm">⚡</span>
            <span>Mastery</span>
          </button>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => setActiveView(item.view)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer',
                activeView === item.view
                  ? 'text-zinc-100 bg-elevated'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-elevated/50',
              )}
            >
              {item.label}
            </button>
          ))}

          {onNavigateLanding && (
            <button
              type="button"
              onClick={onNavigateLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-elevated/50 transition-colors duration-150 cursor-pointer"
              title="Philosophy & Landing"
            >
              <Compass size={14} />
              <span>About</span>
            </button>
          )}

          <div className="w-px h-5 bg-edge mx-2" />

          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-elevated/50 transition-colors duration-150 cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut size={14} />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 w-full',
          activeView === 'dashboard'
            ? 'h-[calc(100dvh-3.5rem)] relative overflow-hidden p-0 m-0 pb-14 md:pb-0'
            : 'mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6 max-w-2xl',
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-t border-edge/50 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors duration-150 cursor-pointer',
                  activeView === item.view
                    ? 'text-accent'
                    : 'text-zinc-500 hover:text-zinc-400',
                )}
                aria-label={item.label}
                aria-current={activeView === item.view ? 'page' : undefined}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
