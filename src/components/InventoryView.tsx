import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Minus,
  X,
  Boxes,
  TrendingUp,
  Cpu,
  Battery,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem, CreateInventoryPayload, PartCategory } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';

export const InventoryView: React.FC = () => {
  const { t, formatCurrency } = useI18n();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add Part Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPart, setNewPart] = useState<CreateInventoryPayload>({
    name: '',
    sku: '',
    category: 'general',
    quantity: 5,
    low_stock_threshold: 3,
    cost_price: 0,
    retail_price: 0,
    compatibility: '',
    notes: '',
  });

  useEffect(() => {
    loadInventory();
  }, [selectedCategory, lowStockOnly]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.listInventory(
        search || undefined,
        selectedCategory === 'all' ? undefined : selectedCategory,
        lowStockOnly
      );
      setItems(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    api
      .listInventory(
        q || undefined,
        selectedCategory === 'all' ? undefined : selectedCategory,
        lowStockOnly
      )
      .then(setItems)
      .catch(console.error);
  };

  const handleAdjustStock = async (id: number, delta: number) => {
    try {
      await api.adjustInventoryStock(id, delta);
      loadInventory();
    } catch (err: any) {
      alert(err?.message || 'Failed to adjust stock');
    }
  };

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.name || !newPart.retail_price) return;
    try {
      await api.createInventoryItem(newPart);
      setIsAddModalOpen(false);
      setNewPart({
        name: '',
        sku: '',
        category: 'general',
        quantity: 5,
        low_stock_threshold: 3,
        cost_price: 0,
        retail_price: 0,
        compatibility: '',
        notes: '',
      });
      loadInventory();
    } catch (err: any) {
      alert(err?.message || 'Failed to add spare part');
    }
  };

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'screen', label: t('cat_screen') },
    { key: 'battery', label: t('cat_battery') },
    { key: 'charging_port', label: t('cat_charging_port') },
    { key: 'board_chip', label: t('cat_board_chip') },
    { key: 'camera', label: t('cat_camera') },
    { key: 'housing', label: t('cat_housing') },
    { key: 'accessory', label: t('cat_accessory') },
    { key: 'general', label: t('cat_general') },
  ];

  const lowStockCount = items.filter((i) => i.is_low_stock).length;
  const totalStockUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValuation = items.reduce((sum, i) => sum + i.quantity * i.retail_price, 0);

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('inventory_title')}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{items.length} SKUs</h3>
            <p className="text-[11px] text-purple-400 mt-0.5">{totalStockUnits} Total units on shelf</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Value
            </p>
            <h3 className="text-xl font-black text-emerald-400 font-mono mt-1">
              {formatCurrency(totalValuation)}
            </h3>
            <p className="text-[11px] text-emerald-400/90 mt-0.5">Estimated retail shelf valuation</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Stock Health
            </p>
            {lowStockCount > 0 ? (
              <h3 className="text-xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{lowStockCount} Items Low</span>
              </h3>
            ) : (
              <h3 className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Optimal Stock Levels</span>
              </h3>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">Reorder alerts tracked automatically</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-925/80 border border-slate-800/80 p-3.5 rounded-2xl">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search part name, SKU barcode, or device compatibility..."
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
              lowStockOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock Only ({lowStockCount})</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-950 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_part_btn')}</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              selectedCategory === c.key
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950'
                : 'bg-slate-925 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800/80'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Spare Parts Ledger Table */}
      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-925/70 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-start">{t('part_name')}</th>
                <th className="px-4 py-3.5 text-start">{t('sku')}</th>
                <th className="px-4 py-3.5 text-start">{t('category')}</th>
                <th className="px-4 py-3.5 text-start">{t('compatibility')}</th>
                <th className="px-4 py-3.5 text-center">{t('stock_qty')}</th>
                <th className="px-4 py-3.5 text-end">{t('retail_price')}</th>
                <th className="px-4 py-3.5 text-center">{t('adjust_stock')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    {loading ? t('loading') : 'No spare parts cataloged in this filter'}
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                          {it.category === 'screen' && <Smartphone className="w-3.5 h-3.5" />}
                          {it.category === 'battery' && <Battery className="w-3.5 h-3.5" />}
                          {it.category === 'board_chip' && <Cpu className="w-3.5 h-3.5" />}
                          {it.category !== 'screen' && it.category !== 'battery' && it.category !== 'board_chip' && (
                            <Package className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {it.name}
                          </span>
                          {it.is_low_stock && (
                            <span
                              title={`Threshold: ${it.low_stock_threshold}`}
                              className="ms-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.2 rounded"
                            >
                              Low
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                      {it.sku || '—'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="capitalize text-[10px] font-semibold bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300 border border-slate-700/60">
                        {it.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate text-[11px]">
                      {it.compatibility || 'Universal'}
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono font-bold">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs ${
                          it.quantity === 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : it.is_low_stock
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800/80 text-emerald-400 border border-slate-700/60'
                        }`}
                      >
                        {it.quantity}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-end font-mono font-bold text-emerald-400 text-xs">
                      {formatCurrency(it.retail_price)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="Deduct 1 from stock"
                          onClick={() => handleAdjustStock(it.id, -1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Add 1 to stock"
                          onClick={() => handleAdjustStock(it.id, 1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-300 border border-slate-700/60 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">{t('add_part_btn')}</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('part_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="e.g. iPhone 14 Pro Max OLED Assembly (Refurbished)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('category')}
                  </label>
                  <select
                    value={newPart.category}
                    onChange={(e) =>
                      setNewPart({ ...newPart, category: e.target.value as PartCategory })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                  >
                    <option value="screen">{t('cat_screen')}</option>
                    <option value="battery">{t('cat_battery')}</option>
                    <option value="charging_port">{t('cat_charging_port')}</option>
                    <option value="board_chip">{t('cat_board_chip')}</option>
                    <option value="camera">{t('cat_camera')}</option>
                    <option value="housing">{t('cat_housing')}</option>
                    <option value="accessory">{t('cat_accessory')}</option>
                    <option value="general">{t('cat_general')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t('sku')} / Barcode
                  </label>
                  <input
                    type="text"
                    value={newPart.sku || ''}
                    onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                    placeholder="e.g. SCR-IP14PM-01"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('stock_qty')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPart.quantity}
                    onChange={(e) =>
                      setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.low_stock_threshold}
                    onChange={(e) =>
                      setNewPart({
                        ...newPart,
                        low_stock_threshold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPart.cost_price || ''}
                    onChange={(e) =>
                      setNewPart({ ...newPart, cost_price: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPart.retail_price || ''}
                    onChange={(e) =>
                      setNewPart({
                        ...newPart,
                        retail_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-indigo-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('compatibility')}
                </label>
                <input
                  type="text"
                  value={newPart.compatibility || ''}
                  onChange={(e) => setNewPart({ ...newPart, compatibility: e.target.value })}
                  placeholder="e.g. iPhone 14 Pro Max (A2894, A2896)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-md shadow-emerald-950"
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
