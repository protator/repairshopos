import React, { useState, useEffect } from 'react';
import { X, Printer, Wrench, QrCode } from 'lucide-react';
import { TicketDetailView, ShopSettings } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';

interface InvoiceModalProps {
  ticketData: TicketDetailView;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  ticketData,
  onClose,
}) => {
  const { t, formatCurrency } = useI18n();
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  const { ticket, customer, items } = ticketData;

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const balanceDue = Math.max(0, ticket.total_price - ticket.deposit_paid);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Action Header - Hidden when printing */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-100 border-b border-slate-200">
          <span className="font-bold text-slate-700 text-sm">
            Invoice Preview: {ticket.ticket_number}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 font-sans space-y-6 text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {settings?.shop_name || 'RepairShop OS'}
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {settings?.shop_address || 'Algiers, Algeria'}
              </p>
              <p className="text-xs text-slate-600 font-mono">
                Tel: {settings?.shop_phone || '+213 555 123 456'}
                {settings?.shop_email && ` | Email: ${settings.shop_email}`}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block mb-1">
                {t('invoice_header')}
              </span>
              <p className="text-sm font-mono font-black text-slate-900">
                {ticket.ticket_number}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Billed To & Device Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {t('invoice_for')}
              </p>
              <p className="font-bold text-sm text-slate-900">{customer.name}</p>
              <p className="font-mono text-slate-600">{customer.primary_phone}</p>
              {customer.email && <p className="text-slate-600">{customer.email}</p>}
              {customer.address && <p className="text-slate-600">{customer.address}</p>}
            </div>

            <div className="text-right">
              <p className="font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Device Details
              </p>
              <p className="font-bold text-sm text-slate-900">
                {ticket.device_brand} {ticket.device_model}
              </p>
              {ticket.imei && (
                <p className="font-mono text-slate-600">IMEI: {ticket.imei}</p>
              )}
              {ticket.serial_number && (
                <p className="font-mono text-slate-600">S/N: {ticket.serial_number}</p>
              )}
              <p className="text-slate-600 capitalize">
                Service: {ticket.repair_type.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Item Description</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5 text-center">Qty</th>
                  <th className="px-3 py-2.5 text-right">Price</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      {it.name}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-slate-600">
                      {it.item_type}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono">{it.quantity}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                      {formatCurrency(it.unit_price)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(it.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & QR Code */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border-2 border-slate-300 rounded-lg flex flex-col items-center justify-center p-1 text-slate-700">
                <QrCode className="w-8 h-8" />
                <span className="text-[8px] font-mono mt-0.5">VERIFIED</span>
              </div>
              <div className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                {settings?.receipt_notes ||
                  'Thank you for your business. Replaced components include a 30-day repair warranty.'}
              </div>
            </div>

            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}:</span>
                <span className="font-mono">{formatCurrency(ticket.total_price)}</span>
              </div>
              {ticket.deposit_paid > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{t('deposit')}:</span>
                  <span className="font-mono">-{formatCurrency(ticket.deposit_paid)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-300">
                <span>{t('grand_total')}:</span>
                <span className="font-mono text-base">
                  {formatCurrency(ticket.total_price)}
                </span>
              </div>
              <div className="flex justify-between font-black text-xs text-indigo-700">
                <span>{t('balance_due')}:</span>
                <span className="font-mono text-sm">{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
