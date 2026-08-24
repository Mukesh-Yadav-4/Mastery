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
    <div
      className={cn(
        'flex flex-col bg-[#060813]',
        activeView === 'dashboard' ? 'h-dvh overflow-hidden' : 'min-h-dvh bg-canvas',
      )}
    >
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 h-14 flex-shrink-0 border-b border-white/[0.08] bg-[#060813]/65 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="text-base font-semibold tracking-tight text-zinc-100 flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group"
            title="View Landing Page & Philosophy"
          >
            <span className="text-accent text-sm drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] group-hover:scale-110 transition-transform">⚡</span>
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent font-bold">Mastery</span>
          </button>
        </div>

        <nav className="flex items-center gap-1.5">
          {/* Holographic Navigation Tabs Capsule */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-inner">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
                  activeView === item.view
                    ? 'text-white bg-white/[0.12] border border-white/20 shadow-[0_0_16px_rgba(129,140,248,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {onNavigateLanding && (
            <button
              type="button"
              onClick={onNavigateLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-150 cursor-pointer"
              title="Philosophy & Landing"
            >
              <Compass size={13} className="text-cyan-400" />
              <span>About</span>
            </button>
          )}

          <div className="w-px h-5 bg-white/[0.08] mx-1" />

          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut size={13} />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 min-h-0 w-full',
          activeView === 'dashboard'
            ? 'relative overflow-hidden p-0 m-0 pb-14 md:pb-0'
            : 'mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6 max-w-2xl',
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#070a16]/85 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_30px_rgba(0,0,0,0.6)] safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => setActiveView(item.view)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'text-accent bg-white/[0.08] border border-white/15 shadow-[0_0_14px_rgba(129,140,248,0.3)]'
                    : 'text-zinc-500 hover:text-zinc-300',
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} className={cn(isActive && 'drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]')} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
