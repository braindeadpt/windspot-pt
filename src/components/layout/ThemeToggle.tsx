'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'windspot:theme';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'coast';
  } catch {
    return false;
  }
}

interface ThemeToggleProps {
  locale: string;
}

export default function ThemeToggle({ locale }: ThemeToggleProps) {
  const isPt = locale === 'pt';
  const [isCoast, setIsCoast] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with DOM after mount (SSR-safe: reads actual class applied by pre-hydration script)
  useEffect(() => {
    setIsCoast(document.documentElement.classList.contains('theme-coast'));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isCoast;
    document.documentElement.classList.toggle('theme-coast', next);
    try {
      localStorage.setItem(THEME_KEY, next ? 'coast' : 'dark');
    } catch {
      /* ignore */
    }
    setIsCoast(next);
  };

  // Prevent hydration mismatch: render a placeholder until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9" aria-hidden="true" />
    );
  }

  const label = isCoast
    ? (isPt ? 'Alternar para tema escuro' : 'Switch to dark theme')
    : (isPt ? 'Alternar para tema claro' : 'Switch to light theme');

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
      title={label}
      aria-label={label}
    >
      {isCoast ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
