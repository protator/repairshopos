import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  CheckCircle2,
  Key,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Clock,
  Receipt,
  BadgePercent,
  CheckCircle,
} from 'lucide-react';
import { ShopSettings, LicenseInfo } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';

export const SettingsView: React.FC = () => {
  const { t, setLanguage, setCurrency } = useI18n();

  const [settings, setSettings] = useState<ShopSettings>({
    shop_name: 'RepairShop OS Lab',
    shop_phone: '+213 555 123 456',
    shop_email: 'contact@repairshop.dz',
    shop_address: 'Algiers, Algeria',
    currency: 'DZD',
    tax_rate_bps: 1900,
    language: 'en',
    warranty_days: 30,
    receipt_notes: 'Warranty applies on parts installed by the lab.',
    logo_path: '',
    operating_hours: 'Sat - Thu: 09:00 - 18:00',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Licensing state
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [activating, setActivating] = useState(false);
  const [licenseFeedback, setLicenseFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedHwid, setCopiedHwid] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLicense();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLicense = async () => {
    try {
      const info = await api.getLicenseInfo();
      setLicenseInfo(info);
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivateLicense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!licenseKeyInput.trim()) return;
    setLicenseFeedback(null);
    setActivating(true);
    try {
      const info = await api.activateLicense(licenseKeyInput.trim());
      setLicenseInfo(info);
      setLicenseKeyInput('');
      setLicenseFeedback({ type: 'success', text: 'License successfully activated!' });
    } catch (err: any) {
      setLicenseFeedback({ type: 'error', text: err?.message || 'Activation failed' });
    } finally {
      setActivating(false);
    }
  };

  const handleCopyHwid = () => {
    if (!licenseInfo?.hardware_id) return;
    navigator.clipboard.writeText(licenseInfo.hardware_id);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setLanguage(updated.language as Language);
      setCurrency(updated.currency);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {t('settings_title')}
            </h1>
            <p className="text-xs text-slate-400">
              Lab Identity, Cryptographic License & Thermal Receipt Configuration
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('settings_saved')}</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Workshop Profile */}
        <div className="glass-card border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>{t('shop_profile')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('shop_name')} *</label>
              <input
                type="text"
                required
                value={settings.shop_name}
                onChange={(e) =>
                  setSettings({ ...settings, shop_name: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('shop_phone')} *</label>
              <input
                type="text"
                required
                value={settings.shop_phone}
                onChange={(e) =>
                  setSettings({ ...settings, shop_phone: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">{t('shop_email')}</label>
              <input
                type="email"
                value={settings.shop_email}
                onChange={(e) =>
                  setSettings({ ...settings, shop_email: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">{t('shop_address')}</label>
              <input
                type="text"
                value={settings.shop_address}
                onChange={(e) =>
                  setSettings({ ...settings, shop_address: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">{t('operating_hours')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('operating_hours_placeholder')}
                  value={settings.operating_hours}
                  onChange={(e) =>
                    setSettings({ ...settings, operating_hours: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">{t('receipt_terms')}</label>
              <textarea
                rows={3}
                value={settings.receipt_notes}
                onChange={(e) =>
                  setSettings({ ...settings, receipt_notes: e.target.value })
                }
                placeholder="Disclaimers printed on A4 & 80mm thermal receipts (e.g. 30 days warranty on display & battery replacements)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency, Taxes & Invoicing */}
        <div className="glass-card border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Currency & Fiscal Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('currency_label')}</label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-indigo-500 font-bold font-mono"
              >
                <option value="DZD">DZD - Algerian Dinar (دينار جزائري)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="CAD">CAD - Canadian Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('tax_label')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.tax_rate_bps}
                  onChange={(e) =>
                    setSettings({ ...settings, tax_rate_bps: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <BadgePercent className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Calculated Rate: {(settings.tax_rate_bps / 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('warranty_label')}</label>
              <input
                type="number"
                value={settings.warranty_days}
                onChange={(e) =>
                  setSettings({ ...settings, warranty_days: Number(e.target.value) })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard days of repair coverage
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">{t('language_label')}</label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    language: e.target.value as 'en' | 'fr' | 'ar',
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="en">English (LTR Interface)</option>
                <option value="fr">Français (LTR Interface)</option>
                <option value="ar">العربية (RTL - واجهة من اليمين إلى اليسار)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-950 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t('loading') : t('save_settings')}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Offline Machine Licensing */}
      <div className="glass-card border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <span>{t('licensing_title')}</span>
          </div>

          {licenseInfo?.is_licensed ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {licenseInfo.license_type === 'developer'
                  ? t('dev_license_status')
                  : t('licensed_status')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>{t('unlicensed_status')}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400">
          {licenseInfo?.is_licensed ? t('license_active_desc') : t('license_inactive_desc')}
        </p>

        {/* Machine ID Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('machine_hwid')}
            </span>
            <span className="font-mono text-xs font-bold text-indigo-400">
              {licenseInfo?.hardware_id || 'Detecting hardware identity...'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyHwid}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors self-start sm:self-center"
          >
            {copiedHwid ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedHwid ? t('hwid_copied') : t('copy_hwid')}</span>
          </button>
        </div>

        {/* Activation Form */}
        <form onSubmit={handleActivateLicense} className="space-y-3">
          <label className="block text-slate-300 text-xs font-semibold">
            {t('license_key_label')}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={t('license_key_placeholder')}
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono tracking-wider focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={activating || !licenseKeyInput.trim()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-950 active:scale-95"
            >
              <Key className="w-4 h-4" />
              <span>{activating ? t('activating') : t('activate_btn')}</span>
            </button>
          </div>

          {licenseFeedback && (
            <p
              className={`text-xs font-semibold ${
                licenseFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {licenseFeedback.text}
            </p>
          )}
        </form>

        {/* Pro Workstation Features Unlocked Grid */}
        <div className="pt-3 border-t border-slate-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Workstation Engine Features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Offline SQLite ACID Storage</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Thermal Receipt (58mm/80mm) & A4 Invoicing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Micro-soldering & Logic Board Telemetry</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Laser Barcode Scanner Omnibox Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
