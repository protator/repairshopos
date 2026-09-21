import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Plus,
  Trash2,
  Printer,
  Wrench,
  Cpu,
  Receipt,
} from 'lucide-react';
import {
  TicketDetailView,
  TicketStatus,
  ItemType,
  InventoryItem,
  AddItemPayload,
} from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { InvoiceModal } from './InvoiceModal';

interface TicketDetailModalProps {
  ticketId: number | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  onClose,
  onRefresh,
}) => {
  const { t, formatCurrency } = useI18n();

  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'billing' | 'invoice'>('overview');
  const [ticketData, setTicketData] = useState<TicketDetailView | null>(null);
  const [loading, setLoading] = useState(false);

  // Billing Form State
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | ''>('');
  const [itemType, setItemType] = useState<ItemType>('part');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemUnitCost, setItemUnitCost] = useState<number>(0);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);

  // Show dedicated invoice print popup
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadTicket();
      loadInventory();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const data = await api.getTicketDetails(ticketId);
      setTicketData(data);
    } catch (e: any) {
      console.error(e?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const items = await api.listInventory();
      setInventoryList(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectInventory = (invId: number | '') => {
    setSelectedInventoryId(invId);
    if (invId === '') {
      setItemName('');
      setItemUnitPrice(0);
      setItemUnitCost(0);
      return;
    }
    const found = inventoryList.find((i) => i.id === invId);
    if (found) {
      setItemName(found.name);
      setItemUnitPrice(found.retail_price);
      setItemUnitCost(found.cost_price);
    }
  };

  const handleAddItem = async () => {
    if (!ticketId || !itemName.trim()) return;
    try {
      const payload: AddItemPayload = {
        item_type: itemType,
        inventory_item_id: selectedInventoryId !== '' ? Number(selectedInventoryId) : undefined,
        name: itemName,
        quantity: Number(itemQty) || 1,
        unit_cost: Number(itemUnitCost) || 0,
        unit_price: Number(itemUnitPrice) || 0,
      };

      await api.addTicketItem(ticketId, payload);
      // Reset form
      setItemName('');
      setSelectedInventoryId('');
      setItemQty(1);
      setItemUnitPrice(0);
      setItemUnitCost(0);
      loadTicket();
      loadInventory();
      onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!ticketId) return;
    try {
      await api.deleteTicketItem(itemId, ticketId);
      loadTicket();
      loadInventory();
      onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to remove item');
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticketId) return;
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      loadTicket();
      onRefresh();
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    }
  };

  if (!ticketId) return null;

  const ticket = ticketData?.ticket;
  const customer = ticketData?.customer;
  const items = ticketData?.items || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {ticket?.ticket_number || 'Loading...'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">
                {ticket?.device_brand} {ticket?.device_model}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                ({customer?.name})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('print')}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Status Progression Bar */}
        <div className="flex items-center justify-between bg-slate-950/40 px-6 py-2 border-b border-slate-800/80 text-xs overflow-x-auto">
          <span className="text-slate-400 font-medium whitespace-nowrap me-2">
            {t('status')}:
          </span>
          <div className="flex items-center gap-1.5">
            {(
              ['new', 'diagnosing', 'waiting_on_parts', 'ready', 'completed'] as TicketStatus[]
            ).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap text-xs ${
                  ticket?.status === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t(`status_${st}` as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/20 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('tab_overview')}</span>
          </button>

          <button
            onClick={() => setActiveTab('tech')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tech'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t('tab_technician')}</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'billing'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>
              {t('tab_billing')} ({items.length})
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading && !ticketData && (
            <div className="py-12 text-center text-slate-500 text-sm">
              {t('loading')}
            </div>
          )}

          {ticket && (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Problem Description Banner */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <p className="text-xs font-semibold text-amber-400 mb-1">
                      {t('problem_description')}
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {ticket.problem_description}
                    </p>
                    {ticket.accessories_received && (
                      <p className="text-xs text-slate-400 mt-2 font-mono">
                        {t('accessories_received')}: {ticket.accessories_received}
                      </p>
                    )}
                  </div>

                  {/* Customer & Hardware Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Specs */}
                    <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Customer Info
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-semibold text-slate-100">{customer?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono text-slate-200">{customer?.primary_phone}</span>
                      </div>
                      {customer?.email && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Email:</span>
                          <span className="text-slate-200">{customer.email}</span>
                        </div>
                      )}
                      {customer?.address && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Address:</span>
                          <span className="text-slate-200">{customer.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Hardware & Security Info */}
                    <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2.5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Device & Security
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Device:</span>
                        <span className="font-semibold text-slate-100">
                          {ticket.device_brand} {ticket.device_model}
                        </span>
                      </div>
                      {ticket.imei && (
                        <div className="flex items-center justify-between text-sm font-mono">
                          <span className="text-slate-400">IMEI:</span>
                          <span className="text-indigo-300">{ticket.imei}</span>
                        </div>
                      )}
                      {ticket.serial_number && (
                        <div className="flex items-center justify-between text-sm font-mono">
                          <span className="text-slate-400">Serial:</span>
                          <span className="text-slate-200">{ticket.serial_number}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Passcode / PIN:</span>
                        <span className="font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded">
                          {ticket.passcode || 'None'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Cloud Status:</span>
                        <span className="text-xs uppercase font-semibold text-slate-300">
                          {ticket.account_lock_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Repair Condition Checklist */}
                  <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      {t('condition_notes_label')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(ticket.condition_checklist || {}).map(([key, val]) => (
                        <div
                          key={key}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                            val
                              ? 'bg-slate-900 text-slate-200'
                              : 'bg-slate-950 text-slate-500'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              val ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <span>{(t as any)(`chk_${key}`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MICRO-SOLDERING & TECH NOTES */}
              {activeTab === 'tech' && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                      <Cpu className="w-4 h-4" />
                      <span>{t('board_diagnostics_title')}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {t('prompt_to_boot')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 0.045 A (Short on VDD_MAIN)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {t('donor_board')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 820-02016-A Donor"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {t('smd_replaced')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('smd_placeholder')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Wrench className="w-4 h-4" />
                      <span>{t('tech_notes_title')}</span>
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Enter technical notes, jumper wire paths, diode mode values, or donor board components..."
                      defaultValue={ticket.technician_notes || ''}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: BILLING & PARTS */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  {/* Add Item Form */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {t('add_line_item')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {t('item_type')}
                        </label>
                        <select
                          value={itemType}
                          onChange={(e) => setItemType(e.target.value as ItemType)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value="part">{t('item_type_part')}</option>
                          <option value="labor">{t('item_type_labor')}</option>
                          <option value="diagnostic">{t('item_type_diagnostic')}</option>
                        </select>
                      </div>

                      {itemType === 'part' && (
                        <div className="sm:col-span-3">
                          <label className="block text-xs text-slate-400 mb-1">
                            {t('select_from_inventory')}
                          </label>
                          <select
                            value={selectedInventoryId}
                            onChange={(e) =>
                              handleSelectInventory(
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-medium"
                          >
                            <option value="">-- Custom / Not in stock --</option>
                            {inventoryList.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} (Stock: {inv.quantity}) - {formatCurrency(inv.retail_price)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 pt-1">
                      <div className="sm:col-span-3">
                        <label className="block text-xs text-slate-400 mb-1">
                          {t('item_name')}
                        </label>
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g. iPhone 13 OLED Assembly or Board diagnostic labor"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {t('item_qty')}
                        </label>
                        <input
                          type="number"
                          value={itemQty}
                          min={1}
                          onChange={(e) => setItemQty(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {t('item_unit_price')}
                        </label>
                        <input
                          type="number"
                          value={itemUnitPrice || ''}
                          onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                          placeholder="0"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Billed Items Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2.5">{t('item_name')}</th>
                          <th className="px-3 py-2.5">{t('item_type')}</th>
                          <th className="px-3 py-2.5 text-center">{t('item_qty')}</th>
                          <th className="px-3 py-2.5 text-right">{t('item_unit_price')}</th>
                          <th className="px-4 py-2.5 text-right">{t('item_total')}</th>
                          <th className="px-2 py-2.5 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-500">
                              No items billed yet
                            </td>
                          </tr>
                        ) : (
                          items.map((it) => (
                            <tr key={it.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="px-4 py-2.5 font-medium text-slate-200">
                                {it.name}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="capitalize text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                                  {it.item_type}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono">{it.quantity}</td>
                              <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                                {formatCurrency(it.unit_price)}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-400">
                                {formatCurrency(it.total_price)}
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <button
                                  onClick={() => handleDeleteItem(it.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="flex flex-col sm:flex-row items-end justify-between gap-4 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>
                        {t('deposit')}:{' '}
                        <span className="font-mono font-bold text-slate-200">
                          {formatCurrency(ticket.deposit_paid)}
                        </span>
                      </p>
                      <p>
                        Warranty: {ticket.warranty_days} days on installed components
                      </p>
                    </div>

                    <div className="w-full sm:w-64 space-y-1.5 text-right text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>{t('subtotal')}:</span>
                        <span className="font-mono text-slate-200">
                          {formatCurrency(ticket.total_price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                        <span>{t('grand_total')}:</span>
                        <span className="font-mono text-emerald-400 text-base">
                          {formatCurrency(ticket.total_price)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-amber-300">
                        <span>{t('balance_due')}:</span>
                        <span className="font-mono">
                          {formatCurrency(Math.max(0, ticket.total_price - ticket.deposit_paid))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {showInvoiceModal && ticketData && (
        <InvoiceModal
          ticketData={ticketData}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};
