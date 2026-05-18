'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Menu, X, Wind, Globe, Search, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import MegaMenu from './MegaMenu';
import SearchPalette from '@/components/search/SearchPalette';
import { getTranslation } from '@/lib/i18n';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<'modalidades' | 'metricas' | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const pathname = usePathname() || '';
  const t = getTranslation(locale as 'pt' | 'en');
  const isPt = locale === 'pt';

  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  const navLabel = t.nav;

  const isActive = (href: string) => pathname === href.split('?')[0];

  const switchLocale = isPt ? 'en' : 'pt';
  const switchPath = (pathname || '').replace(`/${locale}`, `/${switchLocale}`);

  const handleMegaToggle = useCallback((variant: 'modalidades' | 'metricas') => {
    setOpenMega((prev) => (prev === variant ? null : variant));
  }, []);

  const handleMegaClose = useCallback(() => {
    setOpenMega(null);
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  const navLinks = [
    { href: `/${locale}/sazonalidade`, label: navLabel.sazonalidade },
    { href: `/${locale}/compare`, label: navLabel.comparar },
    { href: `/${locale}/news/`, label: navLabel.news },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-xl border-b border-divider"
        onKeyDown={handleKeyDown}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}/`} className="flex items-center gap-2.5 group shrink-0">
              <Wind className="w-8 h-8 text-data-waves group-hover:text-data-waves/80 transition-colors" />
              <span className="text-xl font-bold text-fg tracking-tight">
                Ven<span className="text-data-waves">Tu</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 mx-4" aria-label={navLabel.home}>
              <MegaMenu
                variant="modalidades"
                locale={locale}
                isOpen={openMega === 'modalidades'}
                onToggle={() => handleMegaToggle('modalidades')}
                onClose={handleMegaClose}
              />
              <MegaMenu
                variant="metricas"
                locale={locale}
                isOpen={openMega === 'metricas'}
                onToggle={() => handleMegaToggle('metricas')}
                onClose={handleMegaClose}
              />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-input text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-surface-2 text-fg'
                      : 'text-fg-subtle hover:text-fg hover:bg-surface-1'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={openSearch}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-input text-sm text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
                aria-label={navLabel.search}
              >
                <Search className="w-4 h-4" />
                <span className="text-xs text-fg-subtle/60 hidden lg:inline">
                  {isMac ? '⌘K' : 'Ctrl+K'}
                </span>
              </button>
              <ThemeToggle locale={locale} />
              <Link
                href={switchPath}
                className="flex items-center gap-1 px-3 py-1.5 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
                aria-label={isPt ? 'Switch to English' : 'Mudar para Português'}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs">{isPt ? 'EN' : 'PT'}</span>
              </Link>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-input text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
                aria-label={navLabel.avatar}
                disabled
              >
                <User className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={openSearch}
                className="p-2 rounded-input text-fg-subtle hover:text-fg hover:bg-surface-1 transition-colors"
                aria-label={navLabel.search}
              >
                <Search className="w-5 h-5" />
              </button>
              <ThemeToggle locale={locale} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-input text-fg-subtle hover:text-fg hover:bg-surface-1 transition-colors"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bg-base/95 backdrop-blur-xl border-b border-divider">
            <div className="px-4 py-3 space-y-1">
              <Link
                href={`/${locale}/sazonalidade`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
              >
                {navLabel.sazonalidade}
              </Link>
              <Link
                href={`/${locale}/compare`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
              >
                {navLabel.comparar}
              </Link>
              <div className="border-t border-divider my-2" />
              <Link
                href={`/${locale}/spots/`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
              >
                Spots
              </Link>
              <Link
                href={`/${locale}/news/`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
              >
                {navLabel.news}
              </Link>
              <Link
                href={`/${locale}/about/`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
              >
                {navLabel.about}
              </Link>
              <div className="border-t border-divider my-2" />
              <Link
                href={switchPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
              >
                <Globe className="w-4 h-4" />
                {isPt ? 'Switch to English' : 'Mudar para Português'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search palette (rendered at document level) */}
      {searchOpen && <SearchPalette locale={locale} onClose={closeSearch} />}
    </>
  );
}
