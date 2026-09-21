import React, { useState, useEffect } from 'react';
import { X, Printer, Wrench, QrCode, FileText, Receipt } from 'lucide-react';
import { TicketDetailView, ShopSettings } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { Barcode } from './Barcode';

interface InvoiceModalProps {
  ticketData: TicketDetailView;
  onClose: () => void;
}

type PrintFormat = 'a4' | 'thermal_80' | 'thermal_58';

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  ticketData,
  onClose,
}) => {
  const { t, formatCurrency } = useI18n();
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('thermal_80');

  const { ticket, customer, items } = ticketData;

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handlePrint = () => {
    if (printFormat === 'thermal_80') {
      document.body.classList.add('printing-thermal-80');
    } else if (printFormat === 'thermal_58') {
      document.body.classList.add('printing-thermal-58');
    }

    const cleanup = () => {
      document.body.classList.remove('printing-thermal-80');
      document.body.classList.remove('printing-thermal-58');
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  };

  const balanceDue = Math.max(0, ticket.total_price - ticket.deposit_paid);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full ${
          printFormat === 'a4' ? 'max-w-3xl' : 'max-w-md'
        } bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] transition-all duration-200`}
      >
        {/* Action Header - Hidden when printing */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-xs sm:text-sm hidden sm:inline">
              {ticket.ticket_number}
            </span>
            {/* Format Toggle Buttons */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintFormat('thermal_80')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  printFormat === 'thermal_80'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal_58')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  printFormat === 'thermal_58'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>58mm</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  printFormat === 'a4'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: POS THERMAL RECEIPT (80mm / 58mm) */}
        {/* ========================================================================= */}
        {printFormat !== 'a4' && (
          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-slate-950 space-y-3 bg-white mx-auto ${
              printFormat === 'thermal_80' ? 'w-full max-w-[320px]' : 'w-full max-w-[260px]'
            }`}
          >
            {/* Centered Shop Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wrench className="w-4 h-4 text-slate-900" />
                <h1 className="text-base font-black tracking-tight uppercase">
                  {settings?.shop_name || 'RepairShop OS'}
                </h1>
              </div>
              <p className="text-[11px] text-slate-600">
                {settings?.shop_address || 'Algiers, Algeria'}
              </p>
              <p className="text-[11px] text-slate-600 font-bold">
                TEL: {settings?.shop_phone || '+213 555 123 456'}
              </p>
              {settings?.shop_email && (
                <p className="text-[10px] text-slate-500">{settings.shop_email}</p>
              )}
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Ticket Identifier & Barcode */}
            <div className="text-center space-y-1.5 py-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                REPAIR INTAKE RECEIPT
              </span>
              <p className="text-lg font-black tracking-wider text-slate-900">
                {ticket.ticket_number}
              </p>
              <div className="flex justify-center my-2">
                <Barcode
                  value={ticket.ticket_number}
                  height={printFormat === 'thermal_80' ? 44 : 36}
                  narrowWidth={printFormat === 'thermal_80' ? 1.4 : 1.1}
                  wideWidth={printFormat === 'thermal_80' ? 3.2 : 2.6}
                  showText={false}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Customer & Device Information */}
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Customer:</span>
                <span className="font-bold text-slate-900">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Phone:</span>
                <span className="font-bold">{customer.primary_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase">Device:</span>
                <span className="font-bold">
                  {ticket.device_brand} {ticket.device_model}
                </span>
              </div>
              {ticket.imei && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">IMEI:</span>
                  <span>{ticket.imei}</span>
                </div>
              )}
              {ticket.serial_number && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">S/N:</span>
                  <span>{ticket.serial_number}</span>
                </div>
              )}
              {ticket.lock_type !== 'none' && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500">Lock:</span>
                  <span className="font-semibold">
                    {ticket.lock_type}: {ticket.passcode || 'Pattern set'}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Billed Items */}
            <div className="text-[11px] space-y-1.5">
              <div className="flex justify-between font-bold border-b border-slate-300 pb-1 text-slate-700">
                <span>ITEM / SERVICE</span>
                <span>AMOUNT</span>
              </div>
              {items.length === 0 ? (
                <div className="flex justify-between text-slate-500 italic py-1">
                  <span>Diagnostic / Initial Intake</span>
                  <span>{formatCurrency(ticket.estimated_cost)}</span>
                </div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span className="truncate max-w-[180px]">{it.name}</span>
                      <span className="font-bold">{formatCurrency(it.total_price)}</span>
                    </div>
                    {it.quantity > 1 && (
                      <div className="text-[10px] text-slate-500">
                        {it.quantity} x {formatCurrency(it.unit_price)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Totals */}
            <div className="text-[12px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}:</span>
                <span>{formatCurrency(ticket.total_price || ticket.estimated_cost)}</span>
              </div>
              {ticket.deposit_paid > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{t('deposit')}:</span>
                  <span>-{formatCurrency(ticket.deposit_paid)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-400">
                <span>{t('grand_total')}:</span>
                <span>{formatCurrency(ticket.total_price || ticket.estimated_cost)}</span>
              </div>
              <div className="flex justify-between font-black text-xs text-slate-900">
                <span>{t('balance_due')}:</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2" />

            {/* Terms & Footer */}
            <div className="text-center space-y-2 pt-1">
              <div className="flex justify-center">
                <div className="w-12 h-12 border border-slate-300 rounded flex flex-col items-center justify-center p-0.5">
                  <QrCode className="w-8 h-8 text-slate-700" />
                </div>
              </div>
              <p className="text-[9px] text-slate-600 leading-tight">
                {settings?.receipt_notes || t('ticket_terms_short' as any)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-800">
                *** THANK YOU FOR YOUR TRUST ***
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: STANDARD A4 INVOICE */}
        {/* ========================================================================= */}
        {printFormat === 'a4' && (
          <div className="flex-1 overflow-y-auto p-8 sm:p-12 font-sans space-y-6 text-slate-900 bg-white">
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

              <div className="text-right flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block mb-1">
                  {t('invoice_header')}
                </span>
                <p className="text-sm font-mono font-black text-slate-900">
                  {ticket.ticket_number}
                </p>
                <div className="mt-1">
                  <Barcode
                    value={ticket.ticket_number}
                    height={32}
                    narrowWidth={1.2}
                    wideWidth={2.8}
                    showText={false}
                  />
                </div>
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
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-slate-500 italic">
                        Diagnostic / Initial Intake Service
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => (
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
                    ))
                  )}
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
        )}
      </div>
    </div>
  );
};
