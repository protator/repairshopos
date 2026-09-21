import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import { Customer, CreateCustomerPayload } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';

export const CustomersView: React.FC = () => {
  const { t } = useI18n();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{t('customer_crm_title')}</h1>
            <p className="text-xs text-slate-400">Total Registered: {customers.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search name or phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_customer_btn')}</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="px-5 py-3">Customer Name</th>
              <th className="px-4 py-3">Primary Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Contact Mode</th>
              <th className="px-5 py-3 text-right">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500">
                  {loading ? t('loading') : 'No customers found'}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.primary_phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.email ? (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.email}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {c.address ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-xs">{c.address}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium border border-slate-700/60">
                      {c.communication_preference}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500 font-mono">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">{t('add_customer_btn')}</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">{t('customer_name')} *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Karim Benali"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t('customer_phone')} *</label>
                <input
                  type="text"
                  required
                  value={newCust.primary_phone}
                  onChange={(e) => setNewCust({ ...newCust, primary_phone: e.target.value })}
                  placeholder="0550 12 34 56"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t('customer_email')}</label>
                <input
                  type="email"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="karim@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t('customer_address')}</label>
                <input
                  type="text"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  placeholder="Algiers, Algeria"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md"
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
