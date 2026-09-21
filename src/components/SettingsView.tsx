import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Globe,
  Building,
  CheckCircle2,
  Key,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Clock,
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

  const handleActivate = handleActivateLicense;

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{t('settings_title')}</h1>
            <p className="text-xs text-slate-400">Offline Local Configuration</p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('settings_saved')}</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Shop Identity Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>{t('shop_profile')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{t('shop_name')} *</label>
              <input
                type="text"
                required
                value={settings.shop_name}
                onChange={(e) =>
                  setSettings({ ...settings, shop_name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('shop_phone')} *</label>
              <input
                type="text"
                required
                value={settings.shop_phone}
                onChange={(e) =>
                  setSettings({ ...settings, shop_phone: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('shop_email')}</label>
              <input
                type="email"
                value={settings.shop_email}
                onChange={(e) =>
                  setSettings({ ...settings, shop_email: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('shop_address')}</label>
              <input
                type="text"
                value={settings.shop_address}
                onChange={(e) =>
                  setSettings({ ...settings, shop_address: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('operating_hours')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('operating_hours_placeholder')}
                  value={settings.operating_hours}
                  onChange={(e) =>
                    setSettings({ ...settings, operating_hours: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">{t('receipt_terms')}</label>
              <textarea
                rows={3}
                value={settings.receipt_notes}
                onChange={(e) =>
                  setSettings({ ...settings, receipt_notes: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Localization & Currency Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Localization & Financial Units</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">{t('language_label')}</label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    language: e.target.value as 'en' | 'fr' | 'ar',
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="en">English (LTR)</option>
                <option value="fr">Français (LTR)</option>
                <option value="ar">العربية (RTL - Right to Left)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('currency_label')}</label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="DZD">DZD - Algerian Dinar (دينار جزائري)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="CAD">CAD - Canadian Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('tax_label')}</label>
              <input
                type="number"
                value={settings.tax_rate_bps}
                onChange={(e) =>
                  setSettings({ ...settings, tax_rate_bps: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Current: {(settings.tax_rate_bps / 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">{t('warranty_label')}</label>
              <input
                type="number"
                value={settings.warranty_days}
                onChange={(e) =>
                  setSettings({ ...settings, warranty_days: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t('loading') : t('save_settings')}</span>
          </button>
        </div>
      </form>

      {/* Offline Licensing Section (PRD Section 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <span>{t('licensing_title')}</span>
          </div>

          {licenseInfo?.is_licensed ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{licenseInfo.license_type === 'developer' ? t('dev_license_status') : t('licensed_status')}</span>
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
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              {t('machine_hwid')}
            </span>
            <span className="font-mono text-sm font-bold text-indigo-400">
              {licenseInfo?.hardware_id || 'Detecting hardware...'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyHwid}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors self-start sm:self-center"
          >
            {copiedHwid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHwid ? t('hwid_copied') : t('copy_hwid')}</span>
          </button>
        </div>

        {/* Activation Form */}
        <form onSubmit={handleActivateLicense} className="space-y-3">
          <label className="block text-slate-400 text-xs font-medium">{t('license_key_label')}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={t('license_key_placeholder')}
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono tracking-wider focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={activating || !licenseKeyInput.trim()}
              className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-amber-900/30"
            >
              <Key className="w-4 h-4" />
              <span>{activating ? t('activating') : t('activate_btn')}</span>
            </button>
          </div>

          {licenseFeedback && (
            <p className={`text-xs font-semibold ${licenseFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {licenseFeedback.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
