import React, { useState, useEffect, useRef } from 'react';
import {
  ScanBarcode,
  RotateCw,
  Clock,
  Menu,
  X,
  Plus,
  LayoutDashboard,
  Users,
  Package,
  Settings,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface TopBarProps {
  currentTab: 'dashboard' | 'customers' | 'inventory' | 'settings';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenIntake: () => void;
  onRefresh?: () => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  onOpenIntake,
  onRefresh,
  onToggleSidebar,
}) => {
  const { t } = useI18n();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live bench workstation clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Shortcut key listener: Pressing '/' focuses universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleManualRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: t('dashboard'), subtitle: 'Active Bench & Repair Queue', icon: LayoutDashboard };
      case 'customers':
        return { title: t('customers'), subtitle: 'Client Database & Records', icon: Users };
      case 'inventory':
        return { title: t('inventory'), subtitle: 'Parts Catalog & Stock Balance', icon: Package };
      case 'settings':
        return { title: t('settings'), subtitle: 'Shop Configuration & Security', icon: Settings };
    }
  };

  const breadcrumb = getBreadcrumb();
  const TabIcon = breadcrumb.icon;

  return (
    <header className="h-16 sticky top-0 z-20 bg-slate-925/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 items-center justify-center text-indigo-400">
            <TabIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{breadcrumb.title}</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs">
              {breadcrumb.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Universal Barcode & Ticket Omnibox */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors">
            <ScanBarcode className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl ps-10 pe-16 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans shadow-inner"
          />
          <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="pointer-events-auto p-0.5 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="kbd-badge text-[10px] hidden sm:inline-flex">
                /
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Right: Bench Clock & Fast Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Real-time Workstation Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-slate-200">{timeStr}</span>
            <span className="text-[10px] text-slate-400 uppercase">{dateStr}</span>
          </div>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={handleManualRefresh}
            title="Refresh Bench Data"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-all active:scale-95"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        {/* Quick Intake Button (especially for mobile/tablets) */}
        <button
          onClick={onOpenIntake}
          className="md:hidden flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('new_ticket')}</span>
        </button>
      </div>
    </header>
  );
};
