import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  MapPin,
  X,
  MessageSquare,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';
import { Customer, CreateCustomerPayload, CommunicationPreference } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';

export const CustomersView: React.FC = () => {
  const { t } = useI18n();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [newCust, setNewCust] = useState<CreateCustomerPayload>({
    name: '',
    primary_phone: '',
    secondary_phone: '',
    email: '',
    address: '',
    communication_preference: 'phone',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.listCustomers();
      setCustomers(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) {
      loadCustomers();
      return;
    }
    try {
      const res = await api.searchCustomers(q);
      setCustomers(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.primary_phone) return;
    try {
      await api.createCustomer(newCust);
      setIsAddModalOpen(false);
      setNewCust({
        name: '',
        primary_phone: '',
        secondary_phone: '',
        email: '',
        address: '',
        communication_preference: 'phone',
        notes: '',
      });
      loadCustomers();
    } catch (err: any) {
      alert(err?.message || 'Failed to add customer');
    }
  };

  // WhatsApp quick trigger
  const openWhatsApp = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '213' + clean.substring(1);
    }
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  const whatsappUsersCount = customers.filter(
    (c) => c.communication_preference === 'whatsapp'
  ).length;

  return (
    <div className="space-y-4">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('customer_crm_title')}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{customers.length}</h3>
            <p className="text-[11px] text-indigo-400 mt-0.5">Verified workshop clients</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              WhatsApp Connected
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{whatsappUsersCount}</h3>
            <p className="text-[11px] text-emerald-400/90 mt-0.5">Instant messaging enabled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Database Sync
            </p>
            <h3 className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-dot" />
              <span>SQLite Local Engine</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero-latency offline search</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-925/80 border border-slate-800/80 p-3.5 rounded-2xl">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by client name, primary phone, email or address..."
            className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl ps-10 pe-10 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_customer_btn')}</span>
        </button>
      </div>

      {/* Customers Data Table */}
      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-925/70 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-start">Customer Name</th>
                <th className="px-4 py-3.5 text-start">Contact Phone</th>
                <th className="px-4 py-3.5 text-start">Email Address</th>
                <th className="px-4 py-3.5 text-start">Address</th>
                <th className="px-4 py-3.5 text-start">Channel</th>
                <th className="px-4 py-3.5 text-start">Quick Actions</th>
                <th className="px-5 py-3.5 text-end">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    {loading ? t('loading') : 'No matching customers found'}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shadow-inner">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {c.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            ID #{c.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{c.primary_phone}</span>
                        <button
                          onClick={() => handleCopy(c.id, c.primary_phone)}
                          title="Copy phone"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      {c.email ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      {c.address ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{c.address}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="capitalize text-[10px] font-semibold bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/60">
                        {c.communication_preference}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openWhatsApp(c.primary_phone)}
                          title="Open WhatsApp chat"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-end text-slate-400 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">{t('add_customer_btn')}</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('customer_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Karim Benali"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('customer_phone')} *
                </label>
                <input
                  type="text"
                  required
                  value={newCust.primary_phone}
                  onChange={(e) => setNewCust({ ...newCust, primary_phone: e.target.value })}
                  placeholder="0550 12 34 56"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('customer_email')}
                </label>
                <input
                  type="email"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="karim@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('customer_address')}
                </label>
                <input
                  type="text"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  placeholder="Algiers, Algeria"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('comm_preference')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['phone', 'whatsapp', 'sms', 'email'] as CommunicationPreference[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setNewCust({ ...newCust, communication_preference: mode })}
                      className={`py-1.5 rounded-lg border text-[11px] font-semibold uppercase transition-all ${
                        newCust.communication_preference === mode
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md shadow-indigo-950"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
