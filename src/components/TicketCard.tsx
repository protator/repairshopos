import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Gamepad2,
  Watch,
  Cpu,
  ArrowRight,
  ArrowLeft,
  Phone,
  Check,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { TicketKanbanCard, TicketStatus } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface TicketCardProps {
  card: TicketKanbanCard;
  onClick: (id: number) => void;
  onUpdateStatus: (id: number, newStatus: TicketStatus) => void;
}

const statusOrder: TicketStatus[] = [
  'new',
  'diagnosing',
  'waiting_on_parts',
  'ready',
  'completed',
];

export const TicketCard: React.FC<TicketCardProps> = ({
  card,
  onClick,
  onUpdateStatus,
}) => {
  const { t, formatCurrency, dir } = useI18n();
  const [copiedPhone, setCopiedPhone] = useState(false);

  const currentIndex = statusOrder.indexOf(card.status);
  const prevStatus = currentIndex > 0 ? statusOrder[currentIndex - 1] : null;
  const nextStatus =
    currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  const NextIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const PrevIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(card.customer_phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Device type icon mapping
  const getDeviceIcon = () => {
    const brandModel = `${card.device_brand} ${card.device_model}`.toLowerCase();
    if (brandModel.includes('macbook') || brandModel.includes('laptop') || brandModel.includes('thinkpad')) {
      return <Laptop className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (brandModel.includes('ipad') || brandModel.includes('tablet') || brandModel.includes('tab')) {
      return <Tablet className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (brandModel.includes('playstation') || brandModel.includes('ps5') || brandModel.includes('xbox') || brandModel.includes('switch')) {
      return <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />;
    }
    if (brandModel.includes('desktop') || brandModel.includes('imac') || brandModel.includes('pc')) {
      return <Monitor className="w-3.5 h-3.5 text-slate-300" />;
    }
    if (brandModel.includes('watch')) {
      return <Watch className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
  };

  // Priority color and beacon
  const getPriorityBadge = () => {
    switch (card.priority) {
      case 'urgent':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 beacon-dot" />
            <Flame className="w-2.5 h-2.5 text-rose-400" />
            <span>{t('priority_urgent')}</span>
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
            <span>{t('priority_high')}</span>
          </span>
        );
      case 'normal':
        return (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
            {t('priority_normal')}
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-850 text-slate-400 border border-slate-800">
            {t('priority_low')}
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onClick(card.id)}
      className="group relative glass-card rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer select-none space-y-2.5"
    >
      {/* Top Row: Ticket Number & Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 group-hover:border-indigo-400/50 transition-colors">
            {card.ticket_number}
          </span>
          {card.repair_type === 'board_level' && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded"
              title="Micro-soldering / Logic Board Repair"
            >
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Board</span>
            </span>
          )}
        </div>

        <div>{getPriorityBadge()}</div>
      </div>

      {/* Device Info */}
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
          {getDeviceIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-100 group-hover:text-indigo-200 transition-colors truncate">
            {card.device_brand} {card.device_model}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="truncate max-w-[110px]">{card.customer_name}</span>
            <span className="text-slate-600">•</span>
            <span
              onClick={handleCopyPhone}
              className="flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-indigo-300 transition-colors shrink-0"
              title="Click to copy phone"
            >
              <Phone className="w-2.5 h-2.5 text-slate-400" />
              {card.customer_phone}
              {copiedPhone && <Check className="w-2.5 h-2.5 text-emerald-400" />}
            </span>
          </div>
        </div>
      </div>

      {/* Financials & Quick Stage Controls */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatCurrency(card.total_price)}
            </span>
          </div>
          {card.deposit_paid > 0 && (
            <span className="text-[10px] text-slate-400 font-mono">
              {t('deposit')}: {formatCurrency(card.deposit_paid)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {prevStatus && (
            <button
              title={`Move back to ${t(`status_${prevStatus}` as any)}`}
              onClick={() => onUpdateStatus(card.id, prevStatus)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors"
            >
              <PrevIcon className="w-3 h-3" />
            </button>
          )}

          {nextStatus && (
            <button
              title={`Advance to ${t(`status_${nextStatus}` as any)}`}
              onClick={() => onUpdateStatus(card.id, nextStatus)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-200 hover:text-white bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/50 transition-all shadow-sm active:scale-95"
            >
              <span className="truncate max-w-[80px]">
                {t(`status_${nextStatus}` as any)}
              </span>
              <NextIcon className="w-3 h-3 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
