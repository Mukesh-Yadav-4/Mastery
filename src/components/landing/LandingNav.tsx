import { useState } from 'react';
import { Button } from '../ui/Button';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

interface LandingNavProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function LandingNav({ onSignIn, onSignUp }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-edge/40 bg-canvas/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent font-bold transition-transform group-hover:scale-105">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-50">
            Mastery
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <button
            type="button"
            onClick={() => scrollTo('preview')}
            className="transition-colors hover:text-zinc-100 cursor-pointer"
          >
            Product
          </button>
          <button
            type="button"
            onClick={() => scrollTo('philosophy')}
            className="transition-colors hover:text-zinc-100 cursor-pointer"
          >
            Philosophy
          </button>
          <button
            type="button"
            onClick={() => scrollTo('how-it-works')}
            className="transition-colors hover:text-zinc-100 cursor-pointer"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollTo('disciplines')}
            className="transition-colors hover:text-zinc-100 cursor-pointer"
          >
            Disciplines
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignIn}
            className="text-zinc-300 hover:text-white"
          >
            Sign in
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSignUp}
            className="shadow-md shadow-accent/20 group"
          >
            <span>Start your journey</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onSignUp}
            className="text-xs px-3 h-8"
          >
            Start
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-elevated/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-edge/60 bg-surface/95 backdrop-blur-xl px-4 py-5 animate-slide-up space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-zinc-300">
            <button
              type="button"
              onClick={() => scrollTo('preview')}
              className="text-left py-2 hover:text-accent transition-colors"
            >
              Product Preview
            </button>
            <button
              type="button"
              onClick={() => scrollTo('philosophy')}
              className="text-left py-2 hover:text-accent transition-colors"
            >
              The Philosophy
            </button>
            <button
              type="button"
              onClick={() => scrollTo('how-it-works')}
              className="text-left py-2 hover:text-accent transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollTo('disciplines')}
              className="text-left py-2 hover:text-accent transition-colors"
            >
              Explore Disciplines
            </button>
          </div>

          <div className="pt-3 border-t border-edge/50 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="w-full justify-center"
            >
              Sign in to your account
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onSignUp();
              }}
              className="w-full justify-center gap-2"
            >
              <Sparkles size={16} />
              Start your journey
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
