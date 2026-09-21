import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Settings as SettingsIcon,
  PlusCircle,
  Search,
  Wrench,
  Globe,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';

interface NavbarProps {
  currentTab: 'dashboard' | 'customers' | 'inventory' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'customers' | 'inventory' | 'settings') => void;
  onOpenIntake: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenIntake,
  searchQuery,
  onSearchChange,
}) => {
  const { t, language, setLanguage } = useI18n();

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-indigo-500/20 shadow-lg group-hover:bg-indigo-500 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  {t('app_title')}
                </span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Offline
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Quick Intake Button for Mobile */}
          <button
            onClick={onOpenIntake}
            className="md:hidden flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('new_ticket')}</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg ps-9 pe-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Navigation Tabs and Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </button>

            <button
              onClick={() => onSelectTab('customers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('customers')}</span>
            </button>

            <button
              onClick={() => onSelectTab('inventory')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('inventory')}</span>
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>{t('settings')}</span>
            </button>
          </nav>

          {/* New Ticket Action */}
          <button
            onClick={onOpenIntake}
            className="hidden md:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-emerald-900/30 shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('new_ticket')}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-2 py-1 rounded-lg text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={handleLangChange}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="fr" className="bg-slate-900 text-white">FR</option>
              <option value="ar" className="bg-slate-900 text-white">العربية</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
