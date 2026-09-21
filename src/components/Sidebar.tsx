import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Settings as SettingsIcon,
  PlusCircle,
  Wrench,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';
import { LicenseInfo } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'customers' | 'inventory' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'customers' | 'inventory' | 'settings') => void;
  onOpenIntake: () => void;
  activeTicketsCount?: number;
  lowStockCount?: number;
  licenseInfo?: LicenseInfo | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenIntake,
  activeTicketsCount = 0,
  lowStockCount = 0,
  licenseInfo,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { t, language, setLanguage, currency } = useI18n();
  const [copiedHwid, setCopiedHwid] = useState(false);

  const handleCopyHwid = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (licenseInfo?.hardware_id) {
      navigator.clipboard.writeText(licenseInfo.hardware_id);
      setCopiedHwid(true);
      setTimeout(() => setCopiedHwid(false), 2000);
    }
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: t('dashboard'),
      desc: 'Repair Queue & Bench',
      icon: LayoutDashboard,
      badge: activeTicketsCount > 0 ? activeTicketsCount : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'customers' as const,
      label: t('customers'),
      desc: 'Client CRM & History',
      icon: Users,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'inventory' as const,
      label: t('inventory'),
      desc: 'Spare Parts & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'settings' as const,
      label: t('settings'),
      desc: 'Shop & Hardware Config',
      icon: SettingsIcon,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col bg-slate-925 border-e border-slate-800/80 transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Brand Banner */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
            <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 beacon-dot" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight truncate">
                  {t('app_title')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate">Bench Online</span>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Primary CTA: New Intake */}
      <div className="p-3">
        <button
          onClick={onOpenIntake}
          className={`w-full group relative flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:brightness-110 active:scale-[0.98] transition-all overflow-hidden ${
            isCollapsed ? 'px-2' : ''
          }`}
          title={t('new_ticket')}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <PlusCircle className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-90 duration-300" />
          {!isCollapsed && (
            <>
              <span className="truncate">{t('new_ticket')}</span>
              <kbd className="ms-auto kbd-badge bg-indigo-900/60 border-indigo-400/40 text-indigo-200">
                Ctrl+N
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className={`px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Main Menu'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-white border border-indigo-500/40 shadow-sm shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/80 border border-transparent'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 text-start overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`truncate ${isActive ? 'font-bold text-white' : ''}`}>
                      {item.label}
                    </span>
                    {item.badge !== null && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bench System Status & Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5">
        {!isCollapsed ? (
          <>
            {/* HWID & License summary */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  {licenseInfo?.is_licensed ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="truncate">
                    {licenseInfo?.is_licensed ? 'PRO WORKSTATION' : 'COMMUNITY TIER'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currency}
                </span>
              </div>

              {licenseInfo?.hardware_id && (
                <div
                  onClick={handleCopyHwid}
                  className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:border-slate-700 cursor-pointer transition-all"
                  title="Click to copy Hardware ID"
                >
                  <span className="truncate">HWID: {licenseInfo.hardware_id.slice(0, 10)}...</span>
                  {copiedHwid ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </div>
              )}
            </div>

            {/* Language & Local Switcher */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">Language</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      language === lang
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                licenseInfo?.is_licensed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
              title={licenseInfo?.is_licensed ? 'Pro License Active' : 'Community Mode'}
            >
              {licenseInfo?.is_licensed ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>
            <button
              onClick={() => {
                const nextLang: Language = language === 'en' ? 'fr' : language === 'fr' ? 'ar' : 'en';
                setLanguage(nextLang);
              }}
              className="text-[10px] font-bold uppercase text-slate-400 hover:text-white bg-slate-800/80 px-1.5 py-0.5 rounded"
              title="Toggle Language"
            >
              {language}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
