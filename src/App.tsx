import React, { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { IntakeModal } from './components/IntakeModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CustomersView } from './components/CustomersView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { TicketKanbanCard, TicketStatus } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'customers' | 'inventory' | 'settings'>('dashboard');
  const [tickets, setTickets] = useState<TicketKanbanCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      if (searchQuery.trim()) {
        const res = await api.searchTickets(searchQuery);
        setTickets(res);
      } else {
        const res = await api.listKanbanTickets();
        setTickets(res);
      }
    } catch (e) {
      console.error('Failed to load tickets', e);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N for New Intake
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsIntakeOpen(true);
      }
      // Escape closes open modals
      if (e.key === 'Escape') {
        setIsIntakeOpen(false);
        setSelectedTicketId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateStatus = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      loadTickets();
    } catch (e: any) {
      alert(e?.message || 'Failed to update ticket status');
    }
  };

  const handleTicketCreated = (newTicketId: number) => {
    loadTickets();
    setSelectedTicketId(newTicketId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenIntake={() => setIsIntakeOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {currentTab === 'dashboard' && (
          <KanbanBoard
            tickets={tickets}
            onOpenTicket={(id) => setSelectedTicketId(id)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentTab === 'customers' && <CustomersView />}

        {currentTab === 'inventory' && <InventoryView />}

        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Intake Wizard Modal */}
      {isIntakeOpen && (
        <IntakeModal
          isOpen={isIntakeOpen}
          onClose={() => setIsIntakeOpen(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}

      {/* Workshop Detail & Billing Workbench Modal */}
      {selectedTicketId !== null && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onRefresh={loadTickets}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
