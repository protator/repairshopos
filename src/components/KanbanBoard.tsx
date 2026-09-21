import React from 'react';
import {
  Wrench,
  Clock,
  Package,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { TicketKanbanCard, TicketStatus } from '../types';
import { TicketCard } from './TicketCard';
import { useI18n } from '../i18n/I18nContext';

interface KanbanBoardProps {
  tickets: TicketKanbanCard[];
  onOpenTicket: (ticketId: number) => void;
  onUpdateStatus: (ticketId: number, newStatus: TicketStatus) => void;
}

const columns: { status: TicketStatus; color: string; icon: any }[] = [
  { status: 'new', color: 'border-blue-500/40 text-blue-400', icon: Clock },
  { status: 'diagnosing', color: 'border-amber-500/40 text-amber-400', icon: Wrench },
  { status: 'waiting_on_parts', color: 'border-purple-500/40 text-purple-400', icon: Package },
  { status: 'ready', color: 'border-emerald-500/40 text-emerald-400', icon: CheckCircle2 },
  { status: 'completed', color: 'border-slate-500/40 text-slate-400', icon: CheckCircle2 },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onOpenTicket,
  onUpdateStatus,
}) => {
  const { t, formatCurrency } = useI18n();

  // Compute KPI stats
  const activeCount = tickets.filter(
    (t) => t.status === 'new' || t.status === 'diagnosing'
  ).length;
  const awaitingPartsCount = tickets.filter(
    (t) => t.status === 'waiting_on_parts'
  ).length;
  const readyCount = tickets.filter((t) => t.status === 'ready').length;
  const totalVolume = tickets.reduce((acc, t) => acc + t.total_price, 0);

  return (
    <div className="space-y-4">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t('active_repairs')}</p>
            <p className="text-xl font-bold text-white">{activeCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t('awaiting_parts')}</p>
            <p className="text-xl font-bold text-white">{awaitingPartsCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t('ready_pickup')}</p>
            <p className="text-xl font-bold text-white">{readyCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pipeline Volume</p>
            <p className="text-lg font-bold text-indigo-300">
              {formatCurrency(totalVolume)}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Multi-Column View */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {columns.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.status);
          const ColIcon = col.icon;

          return (
            <div
              key={col.status}
              className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ColIcon className={`w-4 h-4 ${col.color.split(' ')[1]}`} />
                  <span className="font-semibold text-xs text-slate-200">
                    {t(`status_${col.status}` as any)}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/60">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pe-1">
                {colTickets.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-500">
                    No tickets
                  </div>
                ) : (
                  colTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      card={ticket}
                      onClick={onOpenTicket}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
