import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Minus,
  X,
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
      alert(err?.message || 'Failed to add part');
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

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{t('inventory_title')}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Items: {items.length}</span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  <span>
                    {lowStockCount} {t('low_stock_badge')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search part, SKU, model..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_part_btn')}</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === c.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
            lowStockOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Only Low Stock</span>
        </button>
      </div>

      {/* Parts Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="px-5 py-3">{t('part_name')}</th>
              <th className="px-3 py-3">{t('sku')}</th>
              <th className="px-3 py-3">{t('category')}</th>
              <th className="px-3 py-3">{t('compatibility')}</th>
              <th className="px-4 py-3 text-center">{t('stock_qty')}</th>
              <th className="px-4 py-3 text-right">{t('retail_price')}</th>
              <th className="px-4 py-3 text-center">{t('adjust_stock')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  {loading ? t('loading') : 'No spare parts found'}
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-100">
                    <div className="flex items-center gap-2">
                      <span>{it.name}</span>
                      {it.is_low_stock && (
                        <span
                          title={`Threshold: ${it.low_stock_threshold}`}
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.2 rounded"
                        >
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-400">
                    {it.sku || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span className="capitalize text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700/60">
                      {it.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-400 max-w-xs truncate">
                    {it.compatibility || 'Universal'}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold">
                    <span
                      className={`px-2.5 py-1 rounded-md ${
                        it.is_low_stock
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {it.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(it.retail_price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Deduct 1 from stock"
                        onClick={() => handleAdjustStock(it.id, -1)}
                        className="p-1 rounded bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Add 1 to stock"
                        onClick={() => handleAdjustStock(it.id, 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700 transition-colors"
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

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">{t('add_part_btn')}</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">{t('part_name')} *</label>
                <input
                  type="text"
                  required
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="e.g. iPhone 13 OLED Display"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{t('sku')}</label>
                  <input
                    type="text"
                    value={newPart.sku || ''}
                    onChange={(e) => setNewPart({ ...newPart, sku: e.target.value })}
                    placeholder="SCR-IP13-OLED"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{t('category')}</label>
                  <select
                    value={newPart.category}
                    onChange={(e) =>
                      setNewPart({ ...newPart, category: e.target.value as PartCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="screen">{t('cat_screen')}</option>
                    <option value="battery">{t('cat_battery')}</option>
                    <option value="charging_port">{t('cat_charging_port')}</option>
                    <option value="board_chip">{t('cat_board_chip')}</option>
                    <option value="camera">{t('cat_camera')}</option>
                    <option value="housing">{t('cat_housing')}</option>
                    <option value="tool_consumable">{t('cat_tool_consumable')}</option>
                    <option value="accessory">{t('cat_accessory')}</option>
                    <option value="general">{t('cat_general')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{t('stock_qty')}</label>
                  <input
                    type="number"
                    min={0}
                    value={newPart.quantity ?? 5}
                    onChange={(e) =>
                      setNewPart({ ...newPart, quantity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    {t('low_stock_threshold')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPart.low_stock_threshold ?? 3}
                    onChange={(e) =>
                      setNewPart({
                        ...newPart,
                        low_stock_threshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{t('cost_price')}</label>
                  <input
                    type="number"
                    value={newPart.cost_price || ''}
                    onChange={(e) =>
                      setNewPart({ ...newPart, cost_price: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{t('retail_price')} *</label>
                  <input
                    type="number"
                    required
                    value={newPart.retail_price || ''}
                    onChange={(e) =>
                      setNewPart({ ...newPart, retail_price: Number(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t('compatibility')}</label>
                <input
                  type="text"
                  value={newPart.compatibility || ''}
                  onChange={(e) =>
                    setNewPart({ ...newPart, compatibility: e.target.value })
                  }
                  placeholder="e.g. iPhone 13, 13 Pro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
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
