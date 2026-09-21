import React, { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { KanbanBoard } from './components/KanbanBoard';
import { IntakeModal } from './components/IntakeModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CustomersView } from './components/CustomersView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { TicketKanbanCard, TicketStatus, LicenseInfo } from './types';
import { api } from './services/api';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { ScanBarcode } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'customers' | 'inventory' | 'settings'>('dashboard');
  const [tickets, setTickets] = useState<TicketKanbanCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [scanToast, setScanToast] = useState<{ message: string; success: boolean; code: string } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  // Hardware Barcode Scanner Listener
  useBarcodeScanner({
    onScan: async (scannedCode) => {
      try {
        const results = await api.searchTickets(scannedCode);
        if (results && results.length > 0) {
          setSelectedTicketId(results[0].id);
          setScanToast({
            message: `Ticket ${results[0].ticket_number} opened (${results[0].device_brand} ${results[0].device_model})`,
            code: scannedCode,
            success: true,
          });
        } else {
          setScanToast({
            message: `No ticket found matching scanned code`,
            code: scannedCode,
            success: false,
          });
        }
      } catch (err) {
        console.error('Barcode lookup error:', err);
      }
      setTimeout(() => setScanToast(null), 4000);
    },
  });

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

  const loadSystemInfo = useCallback(async () => {
    try {
      const lic = await api.getLicenseInfo();
      setLicenseInfo(lic);
    } catch (e) {
      console.error('Failed to load license info', e);
    }
    try {
      const inv = await api.listInventory();
      const low = inv.filter((i) => i.is_low_stock).length;
      setLowStockCount(low);
    } catch (e) {
      console.error('Failed to load inventory stock info', e);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    loadSystemInfo();
  }, [loadSystemInfo]);

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

  const activeTicketsCount = tickets.filter(
    (t) => t.status === 'new' || t.status === 'diagnosing'
  ).length;

  return (
    <div className="h-screen w-screen bg-slate-975 text-slate-100 flex overflow-hidden antialiased selection:bg-indigo-500 selection:text-white">
      {/* Desktop Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenIntake={() => setIsIntakeOpen(true)}
        activeTicketsCount={activeTicketsCount}
        lowStockCount={lowStockCount}
        licenseInfo={licenseInfo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <TopBar
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenIntake={() => setIsIntakeOpen(true)}
          onRefresh={() => {
            loadTickets();
            loadSystemInfo();
          }}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Scrollable Workstation Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/30 via-slate-975 to-slate-975">
          <div className="max-w-[1600px] w-full mx-auto space-y-4">
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
          </div>
        </main>
      </div>

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

      {/* Laser Barcode Scanner HUD Toast */}
      {scanToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 border border-slate-700/80 shadow-2xl p-3.5 rounded-2xl animate-fade-in text-xs max-w-md backdrop-blur-md">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              scanToast.success
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            <ScanBarcode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200">
              <span>SCANNER:</span>
              <span className="text-indigo-400">{scanToast.code}</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">{scanToast.message}</p>
          </div>
        </div>
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
