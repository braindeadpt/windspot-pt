'use client';

import { Layers, MessageCircle, User, BarChart3 } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

interface SidebarRightProps {
  locale: string;
}

interface SidebarItem {
  id: string;
  icon: typeof Layers;
  i18nKey: string;
  active: boolean;
  placeholder?: boolean;
}

export default function SidebarRight({ locale }: SidebarRightProps) {
  const t = getTranslation(locale as 'pt' | 'en');
  const isPt = locale === 'pt';

  const items: SidebarItem[] = [
    { id: 'camadas', icon: Layers, i18nKey: 'sidebarCamadas', active: true },
    { id: 'chat', icon: MessageCircle, i18nKey: 'sidebarChat', active: true },
    { id: 'perfil', icon: User, i18nKey: 'sidebarPerfil', active: false, placeholder: true },
    { id: 'rankings', icon: BarChart3, i18nKey: 'sidebarRankings', active: false, placeholder: true },
  ];

  return (
    <aside
      className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4 py-4 px-2 border-l border-divider bg-bg-base/50 backdrop-blur-sm"
      aria-label={isPt ? 'Barra lateral' : 'Sidebar'}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            disabled={!item.active}
            className="relative flex flex-col items-center justify-center w-10 h-10 rounded-input text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            aria-label={t.nav[item.i18nKey as keyof typeof t.nav] as string}
            title={t.nav[item.i18nKey as keyof typeof t.nav] as string}
          >
            <Icon className="w-5 h-5" />
            {item.placeholder && (
              <span className="absolute -top-1 -right-1 flex h-3.5 px-1 items-center justify-center rounded-full bg-data-waves/20 text-[8px] font-bold text-data-waves uppercase leading-none">
                {t.nav.sidebarEmBreve}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
