import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  Package,
  CheckCircle2,
  TrendingUp,
  Filter,
  Archive,
  Flame,
  Cpu,
  Layers,
} from 'lucide-react';
import { TicketKanbanCard, TicketStatus } from '../types';
import { TicketCard } from './TicketCard';
import { useI18n } from '../i18n/I18nContext';

interface KanbanBoardProps {
  tickets: TicketKanbanCard[];
  onOpenTicket: (ticketId: number) => void;
  onUpdateStatus: (ticketId: number, newStatus: TicketStatus) => void;
}

type QuickFilter = 'all' | 'urgent' | 'board_level' | 'ready';

const columns: {
  status: TicketStatus;
  titleKey: string;
  colorBorder: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  icon: any;
}[] = [
  {
    status: 'new',
    titleKey: 'status_new',
    colorBorder: 'border-t-blue-500',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-400',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Clock,
  },
  {
    status: 'diagnosing',
    titleKey: 'status_diagnosing',
    colorBorder: 'border-t-amber-500',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Wrench,
  },
  {
    status: 'waiting_on_parts',
    titleKey: 'status_waiting_on_parts',
    colorBorder: 'border-t-purple-500',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-400',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Package,
  },
  {
    status: 'ready',
    titleKey: 'status_ready',
    colorBorder: 'border-t-emerald-500',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  {
    status: 'completed',
    titleKey: 'status_completed',
    colorBorder: 'border-t-slate-500',
    badgeBg: 'bg-slate-500/15 border-slate-500/30',
    badgeText: 'text-slate-400',
    iconBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: Archive,
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  onOpenTicket,
  onUpdateStatus,
}) => {
  const { t, formatCurrency } = useI18n();
  const [filter, setFilter] = useState<QuickFilter>('all');

  // Filtered ticket set
  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'urgent') return ticket.priority === 'urgent' || ticket.priority === 'high';
    if (filter === 'board_level') return ticket.repair_type === 'board_level';
    if (filter === 'ready') return ticket.status === 'ready';
    return true;
  });

  // Calculate Bench KPIs
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
      {/* Executive Bench Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Repairs */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('active_repairs')}
              </p>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                {activeCount}
              </h3>
              <p className="text-[11px] text-blue-400/90 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 beacon-dot" />
                <span>Bench queue in progress</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-md shadow-blue-950">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Awaiting Parts */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('awaiting_parts')}
              </p>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                {awaitingPartsCount}
              </h3>
              <p className="text-[11px] text-purple-400/90 mt-1">
                <span>Spare parts pending delivery</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-md shadow-purple-950">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Ready for Pickup */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('ready_pickup')}
              </p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">
                {readyCount}
              </h3>
              <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Ready for customer handover</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Revenue / Pipeline Volume */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pipeline Volume
              </p>
              <h3 className="text-xl font-black text-indigo-300 mt-1 tracking-tight font-mono">
                {formatCurrency(totalVolume)}
              </h3>
              <p className="text-[11px] text-indigo-400/90 mt-1">
                <span>{tickets.length} total work orders</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-925/80 border border-slate-800/80 p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 px-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            All Work Orders ({tickets.length})
          </button>

          <button
            onClick={() => setFilter('urgent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'urgent'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Urgent / High Priority</span>
          </button>

          <button
            onClick={() => setFilter('board_level')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'board_level'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Board-Level Repairs</span>
          </button>

          <button
            onClick={() => setFilter('ready')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'ready'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Pickup</span>
          </button>
        </div>
      </div>

      {/* Kanban Multi-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {columns.map((col) => {
          const colTickets = filteredTickets.filter((t) => t.status === col.status);
          const ColIcon = col.icon;
          const colSum = colTickets.reduce((sum, t) => sum + t.total_price, 0);

          return (
            <div
              key={col.status}
              className={`bg-slate-925/70 border border-slate-800/80 border-t-4 ${col.colorBorder} rounded-2xl p-3 flex flex-col min-h-[580px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${col.iconBg} flex items-center justify-center`}>
                    <ColIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">
                      {t(col.titleKey as any)}
                    </h4>
                    {colSum > 0 && (
                      <p className="text-[10px] font-mono text-slate-400">
                        {formatCurrency(colSum)}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${col.badgeBg} ${col.badgeText}`}
                >
                  {colTickets.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pe-1">
                {colTickets.length === 0 ? (
                  <div className="h-36 border-2 border-dashed border-slate-800/70 rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1">
                    <Layers className="w-6 h-6 text-slate-400/80" />
                    <p className="text-xs font-medium">Empty Stage</p>
                    <p className="text-[11px] text-slate-400">No work orders here</p>
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
