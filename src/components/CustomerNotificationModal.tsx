import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Send,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { TicketDetailView, ShopSettings } from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';

interface CustomerNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: TicketDetailView;
}

type NotificationTemplate = 'intake' | 'quote' | 'ready' | 'completed';

export const CustomerNotificationModal: React.FC<CustomerNotificationModalProps> = ({
  isOpen,
  onClose,
  ticketData,
}) => {
  const { t, formatCurrency } = useI18n();
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  const [template, setTemplate] = useState<NotificationTemplate>(() => {
    if (ticketData.ticket.status === 'ready') return 'ready';
    if (ticketData.ticket.status === 'completed') return 'completed';
    if (ticketData.ticket.status === 'diagnosing') return 'quote';
    return 'intake';
  });

  const [msgLang, setMsgLang] = useState<Language>('fr');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  const { ticket, customer } = ticketData;

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  // Format clean international phone number for WhatsApp
  const cleanPhone = (phoneStr: string): string => {
    let clean = phoneStr.replace(/[^0-9+]/g, '');
    if (clean.startsWith('+')) {
      clean = clean.substring(1);
    } else if (clean.startsWith('00')) {
      clean = clean.substring(2);
    } else if (clean.startsWith('0') && clean.length === 10) {
      // Standard Algerian mobile: 05xx, 06xx, 07xx -> 2135xx
      clean = '213' + clean.substring(1);
    }
    return clean;
  };

  const balanceDue = Math.max(0, ticket.total_price - ticket.deposit_paid);
  const shopName = settings?.shop_name || 'RepairShop OS';
  const shopPhone = settings?.shop_phone || '';
  const shopAddress = settings?.shop_address || '';

  // Generate template message text based on selected template and language
  const generateMessage = (tmpl: NotificationTemplate, lang: Language): string => {
    const dev = `${ticket.device_brand} ${ticket.device_model}`;
    const priceStr = formatCurrency(ticket.total_price || ticket.estimated_cost);
    const balanceStr = formatCurrency(balanceDue);

    if (lang === 'ar') {
      switch (tmpl) {
        case 'intake':
          return `مرحباً ${customer.name}،\nتم استلام جهازك (${dev}) في ورشة ${shopName} بنجاح.\nرقم الوصل: ${ticket.ticket_number}\nالتكلفة التقديرية: ${priceStr}\nللاستفسار: ${shopPhone}\nشكراً لثقتكم بنا!`;
        case 'quote':
          return `مرحباً ${customer.name}،\nتم الانتهاء من الفحص والتشخيص لجهازك (${dev}) في ورشة ${shopName}.\nتكلفة التصليح: ${priceStr}\nيرجى تأكيد موافقتك لبدء الصيانة.\nرقم الوصل: ${ticket.ticket_number}`;
        case 'ready':
          return `مرحباً ${customer.name}،\nيسرنا إعلامك أن جهازك (${dev}) جاهز للاستلام في ورشة ${shopName}!\nرقم الوصل: ${ticket.ticket_number}\nالمبلغ المتبقي: ${balanceStr}\nالعنوان: ${shopAddress}\nأوقات العمل: ${settings?.operating_hours || '09:00 - 18:00'}`;
        case 'completed':
          return `مرحباً ${customer.name}،\nشكراً لتعاملك مع ${shopName}. جهازك (${dev}) تم تسليمه بنجاح.\nيسري ضمان الصيانة لمدة ${ticket.warranty_days} يوماً على القطع المستبدلة.\nنسعد دائماً بخدمتكم!`;
      }
    } else if (lang === 'fr') {
      switch (tmpl) {
        case 'intake':
          return `Bonjour ${customer.name},\nVotre appareil (${dev}) a bien été réceptionné à l'atelier ${shopName}.\nN° de ticket : ${ticket.ticket_number}\nDevis estimatif : ${priceStr}\nTél : ${shopPhone}\nMerci de votre confiance.`;
        case 'quote':
          return `Bonjour ${customer.name},\nLe diagnostic de votre ${dev} est terminé à l'atelier ${shopName}.\nMontant de la réparation : ${priceStr}\nMerci de nous confirmer votre accord pour procéder à la réparation.\nRéf : ${ticket.ticket_number}`;
        case 'ready':
          return `Bonjour ${customer.name},\nBonne nouvelle ! Votre ${dev} est réparé et prêt à être récupéré chez ${shopName}.\nRéf Ticket : ${ticket.ticket_number}\nReste à payer : ${balanceStr}\nAdresse : ${shopAddress}\nHoraires : ${settings?.operating_hours || '09h - 18h'}`;
        case 'completed':
          return `Bonjour ${customer.name},\nMerci d'avoir choisi ${shopName}. Votre appareil (${dev}) vous a été remis avec une garantie de ${ticket.warranty_days} jours sur les pièces remplacées.\nÀ bientôt !`;
      }
    } else {
      switch (tmpl) {
        case 'intake':
          return `Hello ${customer.name},\nYour device (${dev}) has been checked in at ${shopName}.\nTicket Ref: ${ticket.ticket_number}\nEstimated Quote: ${priceStr}\nContact: ${shopPhone}\nThank you for choosing us.`;
        case 'quote':
          return `Hello ${customer.name},\nDiagnostics for your ${dev} are complete at ${shopName}.\nRepair Cost: ${priceStr}\nPlease confirm your approval so we can begin repair.\nTicket: ${ticket.ticket_number}`;
        case 'ready':
          return `Hello ${customer.name},\nGreat news! Your ${dev} is repaired and ready for pickup at ${shopName}.\nTicket: ${ticket.ticket_number}\nBalance Due: ${balanceStr}\nLocation: ${shopAddress}\nHours: ${settings?.operating_hours || '09:00 - 18:00'}`;
        case 'completed':
          return `Hello ${customer.name},\nThank you for visiting ${shopName}. Your ${dev} was collected with a ${ticket.warranty_days}-day warranty on replaced components.\nHave a great day!`;
      }
    }
  };

  // Sync custom text when template or language changes
  useEffect(() => {
    setCustomText(generateMessage(template, msgLang));
  }, [template, msgLang, ticketData, settings]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const phone = cleanPhone(customer.primary_phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(customText)}`;
    window.open(url, '_blank');
  };

  const handleOpenSMS = () => {
    const phone = cleanPhone(customer.primary_phone);
    const url = `sms:${phone}?body=${encodeURIComponent(customText)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t('notification_title' as any) || 'Customer Notification (WhatsApp / SMS)'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {customer.name} ({customer.primary_phone}) • {ticket.ticket_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Template & Language Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Notification Trigger
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as NotificationTemplate)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="intake">
                  {t('template_intake' as any) || '1. Intake Confirmation'}
                </option>
                <option value="quote">
                  {t('template_quote' as any) || '2. Diagnostic & Quote Approval'}
                </option>
                <option value="ready">
                  {t('template_ready' as any) || '3. Ready for Pickup'}
                </option>
                <option value="completed">
                  {t('template_completed' as any) || '4. Delivered & Warranty'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('msg_language' as any) || 'Message Language'}
              </label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(
                  [
                    { code: 'fr', label: 'Français' },
                    { code: 'ar', label: 'العربية' },
                    { code: 'en', label: 'English' },
                  ] as { code: Language; label: string }[]
                ).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setMsgLang(lang.code)}
                    className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all ${
                      msgLang === lang.code
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editable Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Message Preview (Editable)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {customText.length} characters
              </span>
            </div>

            <textarea
              rows={7}
              dir={msgLang === 'ar' ? 'rtl' : 'ltr'}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Destination Phone Badge */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Target Phone:</span>
              <span className="font-mono font-bold text-slate-200">
                {customer.primary_phone}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                (Formatted: +{cleanPhone(customer.primary_phone)})
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenSMS}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Open default SMS application"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SMS</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
