import React from 'react';
import {
  Smartphone,
  Laptop,
  Cpu,
  ArrowRight,
  ArrowLeft,
  Phone,
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

  const currentIndex = statusOrder.indexOf(card.status);
  const prevStatus = currentIndex > 0 ? statusOrder[currentIndex - 1] : null;
  const nextStatus =
    currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  const priorityColors = {
    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    normal: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    low: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  const NextIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const PrevIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div
      onClick={() => onClick(card.id)}
      className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
    >
      {/* Header: Ticket Number & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
          {card.ticket_number}
        </span>
        <div className="flex items-center gap-1.5">
          {card.repair_type === 'board_level' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
              <Cpu className="w-3 h-3" />
              <span>Micro-solder</span>
            </span>
          )}
          <span
            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
              priorityColors[card.priority]
            }`}
          >
            {t(`priority_${card.priority}` as any)}
          </span>
        </div>
      </div>

      {/* Device Info */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
          {card.device_brand.toLowerCase().includes('mac') ||
          card.device_model.toLowerCase().includes('laptop') ? (
            <Laptop className="w-3.5 h-3.5" />
          ) : (
            <Smartphone className="w-3.5 h-3.5" />
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-slate-100 truncate">
            {card.device_brand} {card.device_model}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="truncate">{card.customer_name}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Phone className="w-3 h-3 text-slate-500" />
              {card.customer_phone}
            </span>
          </div>
        </div>
      </div>

      {/* Financials & Status Controls */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400">
            {formatCurrency(card.total_price)}
          </span>
          {card.deposit_paid > 0 && (
            <span className="block text-[10px] text-slate-400">
              {t('deposit')}: {formatCurrency(card.deposit_paid)}
            </span>
          )}
        </div>

        {/* Stage Advancement Buttons */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {prevStatus && (
            <button
              title={`Move to ${t(`status_${prevStatus}` as any)}`}
              onClick={() => onUpdateStatus(card.id, prevStatus)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <PrevIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {nextStatus && (
            <button
              title={`Advance to ${t(`status_${nextStatus}` as any)}`}
              onClick={() => onUpdateStatus(card.id, nextStatus)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-2 py-1 rounded-md text-xs font-medium transition-all"
            >
              <span className="text-[11px] hidden sm:inline">
                {t(`status_${nextStatus}` as any)}
              </span>
              <NextIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
