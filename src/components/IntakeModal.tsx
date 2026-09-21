import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Gamepad2,
  Watch,
  HelpCircle,
  Search,
  CheckCircle2,
  Camera,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Key,
  ClipboardCheck,
  Receipt,
  Users,
  AlertTriangle,
  Cpu,
  Check,
} from 'lucide-react';
import {
  Customer,
  CreateCustomerPayload,
  CreateTicketPayload,
  DeviceType,
  LockType,
  RepairType,
  TicketPriority,
  AccountLockStatus,
  ConditionChecklist,
  HardwareSpecs,
} from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';
import { CameraCaptureModal, PhotoStage } from './CameraCaptureModal';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticketId: number) => void;
}

const deviceOptions: { type: DeviceType; label: string; icon: any }[] = [
  { type: 'smartphone', label: 'Smartphone', icon: Smartphone },
  { type: 'tablet', label: 'Tablet / iPad', icon: Tablet },
  { type: 'laptop', label: 'Laptop / Mac', icon: Laptop },
  { type: 'desktop', label: 'Desktop / PC', icon: Monitor },
  { type: 'console', label: 'Console (PS/Xbox)', icon: Gamepad2 },
  { type: 'wearable', label: 'Smartwatch', icon: Watch },
  { type: 'other', label: 'Other Device', icon: HelpCircle },
];

export const IntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const { t, dir } = useI18n();

  // Intake Photos State
  const [stagedPhotos, setStagedPhotos] = useState<
    { stage: PhotoStage; dataUrl: string; notes?: string }[]
  >([]);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Stepper state (1 to 5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Customer state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CreateCustomerPayload>({
    name: '',
    primary_phone: '',
    secondary_phone: '',
    email: '',
    address: '',
    communication_preference: 'phone',
  });

  // Device & Specs state
  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone');
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei, setImei] = useState('');

  const [hardwareSpecs, setHardwareSpecs] = useState<HardwareSpecs>({
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    os_version: '',
    battery_health: '',
    custom_specs: '',
  });

  // Lock state
  const [lockType, setLockType] = useState<LockType>('pin');
  const [passcode, setPasscode] = useState('');
  const [accountLock, setAccountLock] = useState<AccountLockStatus>('unlocked');

  // Condition checklist
  const [checklist, setChecklist] = useState<ConditionChecklist>({
    power_on: true,
    screen_cracked: false,
    touch_functional: true,
    display_blemishes: false,
    liquid_damage_indicator: false,
    charges_properly: true,
    front_camera_working: true,
    rear_camera_working: true,
    biometrics_working: true,
    speaker_earpiece_working: true,
    microphone_working: true,
    housing_bent_dented: false,
    buttons_functional: true,
    sim_tray_present: true,
  });

  // Problem & Financials
  const [problemDescription, setProblemDescription] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('');
  const [repairType, setRepairType] = useState<RepairType>('modular');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [liabilityWaiver, setLiabilityWaiver] = useState<boolean>(true);

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialCustomers();
    }
  }, [isOpen]);

  const loadInitialCustomers = async () => {
    try {
      const res = await api.listCustomers();
      setCustomers(res.slice(0, 10));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchCustomers = async (query: string) => {
    setCustomerSearch(query);
    if (!query.trim()) {
      loadInitialCustomers();
      return;
    }
    try {
      const res = await api.searchCustomers(query);
      setCustomers(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleChecklist = (key: keyof ConditionChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddPhoto = (data: { stage: PhotoStage; dataUrl: string; notes?: string }) => {
    setStagedPhotos((prev) => [...prev, data]);
    setShowCameraModal(false);
  };

  const handleRemovePhoto = (index: number) => {
    setStagedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (isCreatingCustomer) {
        if (!newCustomer.name.trim() || !newCustomer.primary_phone.trim()) {
          setError('Please provide customer name and phone number');
          return false;
        }
      } else if (!selectedCustomer) {
        setError('Please select an existing customer or register a new one');
        return false;
      }
    }
    if (step === 2) {
      if (!deviceBrand.trim() || !deviceModel.trim()) {
        setError('Please provide both device brand and model');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as any);
      }
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      let finalCustomerId = selectedCustomer?.id;

      if (isCreatingCustomer || !finalCustomerId) {
        if (!newCustomer.name || !newCustomer.primary_phone) {
          setError('Customer name and primary phone are required');
          setCurrentStep(1);
          setLoading(false);
          return;
        }
        const createdCust = await api.createCustomer(newCustomer);
        finalCustomerId = createdCust.id;
      }

      if (!deviceBrand || !deviceModel) {
        setError('Device brand and model are required');
        setCurrentStep(2);
        setLoading(false);
        return;
      }

      if (!problemDescription.trim()) {
        setError('Please describe the reported issue or customer complaint');
        setCurrentStep(5);
        setLoading(false);
        return;
      }

      const payload: CreateTicketPayload = {
        customer_id: finalCustomerId,
        device_type: deviceType,
        device_brand: deviceBrand,
        device_model: deviceModel,
        device_color: deviceColor || undefined,
        serial_number: serialNumber || undefined,
        imei: imei || undefined,
        lock_type: lockType,
        passcode: passcode || undefined,
        account_lock_status: accountLock,
        condition_checklist: checklist,
        problem_description: problemDescription,
        accessories_received: accessoriesReceived || undefined,
        hardware_specs: hardwareSpecs,
        repair_type: repairType,
        priority,
        estimated_cost: estimatedCost,
        deposit_paid: depositPaid,
        liability_waiver_signed: liabilityWaiver,
      };

      const result = await api.createTicket(payload);

      // Attach any photos captured during intake
      for (const p of stagedPhotos) {
        try {
          await api.addTicketPhoto(result.ticket.id, p.stage, p.dataUrl, p.notes);
        } catch (photoErr) {
          console.error('Failed to attach intake photo:', photoErr);
        }
      }

      onTicketCreated(result.ticket.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate repair intake ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const stepsList = [
    { step: 1, title: 'Customer', icon: Users },
    { step: 2, title: 'Device', icon: Smartphone },
    { step: 3, title: 'Security', icon: Key },
    { step: 4, title: 'Checklist', icon: ClipboardCheck },
    { step: 5, title: 'Billing', icon: Receipt },
  ];

  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-925 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {t('intake_title')}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold uppercase">
                  Step {currentStep} of 5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workstation Bench Device Check-In & Pre-Repair Assessment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Connected Stepper */}
        <div className="bg-slate-950/50 border-b border-slate-800/80 px-6 py-3 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
            {stepsList.map((item, idx) => {
              const StepIcon = item.icon;
              const isPassed = currentStep > item.step;
              const isCurrent = currentStep === item.step;

              return (
                <React.Fragment key={item.step}>
                  <button
                    onClick={() => {
                      if (item.step < currentStep || validateStep(currentStep)) {
                        setCurrentStep(item.step as any);
                      }
                    }}
                    className={`flex items-center gap-2 py-1 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                        : isPassed
                        ? 'text-emerald-400 hover:bg-slate-850'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-3 h-3" /> : <StepIcon className="w-3 h-3" />}
                    </div>
                    <span>{item.title}</span>
                  </button>

                  {idx < stepsList.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 rounded-full ${
                        isPassed ? 'bg-emerald-500/60' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CUSTOMER */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Segmented Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCustomer(false);
                    setError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    !isCreatingCustomer
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('select_customer')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCustomer(true);
                    setSelectedCustomer(null);
                    setError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    isCreatingCustomer
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + {t('or_create_customer')}
                </button>
              </div>

              {!isCreatingCustomer ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type customer name, phone number, or email..."
                      value={customerSearch}
                      onChange={(e) => handleSearchCustomers(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl ps-10 pe-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pe-1">
                    {customers.map((c) => {
                      const isSelected = selectedCustomer?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCustomer(c)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{c.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {c.primary_phone}
                                {c.email && ` • ${c.email}`}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t('customer_name')} *
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="e.g. Karim Benali"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t('customer_phone')} *
                    </label>
                    <input
                      type="text"
                      value={newCustomer.primary_phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, primary_phone: e.target.value })
                      }
                      placeholder="0550 12 34 56"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {t('customer_secondary_phone')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.secondary_phone || ''}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, secondary_phone: e.target.value })
                      }
                      placeholder="Optional"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {t('customer_email')}
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email || ''}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      placeholder="karim@example.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {t('customer_address')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.address || ''}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, address: e.target.value })
                      }
                      placeholder="Algiers, Algeria"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DEVICE & HARDWARE SPECS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-2">
                  Select Device Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {deviceOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = deviceType === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setDeviceType(opt.type)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <OptIcon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-semibold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('device_brand')} *
                  </label>
                  <input
                    type="text"
                    value={deviceBrand}
                    onChange={(e) => setDeviceBrand(e.target.value)}
                    placeholder="e.g. Apple, Samsung, Xiaomi, HP, Dell"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('device_model')} *
                  </label>
                  <input
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro, Galaxy S23, XPS 15"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t('device_color')}
                  </label>
                  <input
                    type="text"
                    value={deviceColor}
                    onChange={(e) => setDeviceColor(e.target.value)}
                    placeholder="e.g. Space Gray, Midnight Blue"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t('serial_number')}
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Serial Number / Service Tag"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t('imei')}
                  </label>
                  <input
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="15-digit IMEI number (cellular devices)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Hardware Specs Card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Hardware Specifications (Optional)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Processor (CPU)</label>
                    <input
                      type="text"
                      value={hardwareSpecs.cpu || ''}
                      onChange={(e) => setHardwareSpecs({ ...hardwareSpecs, cpu: e.target.value })}
                      placeholder="e.g. M2, Core i7, A16"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Memory (RAM)</label>
                    <input
                      type="text"
                      value={hardwareSpecs.ram || ''}
                      onChange={(e) => setHardwareSpecs({ ...hardwareSpecs, ram: e.target.value })}
                      placeholder="e.g. 16GB DDR5"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Storage SSD/HDD</label>
                    <input
                      type="text"
                      value={hardwareSpecs.storage || ''}
                      onChange={(e) => setHardwareSpecs({ ...hardwareSpecs, storage: e.target.value })}
                      placeholder="e.g. 512GB NVMe"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Battery Health</label>
                    <input
                      type="text"
                      value={hardwareSpecs.battery_health || ''}
                      onChange={(e) => setHardwareSpecs({ ...hardwareSpecs, battery_health: e.target.value })}
                      placeholder="e.g. 84%, 320 Cycles"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Operating System</label>
                    <input
                      type="text"
                      value={hardwareSpecs.os_version || ''}
                      onChange={(e) => setHardwareSpecs({ ...hardwareSpecs, os_version: e.target.value })}
                      placeholder="e.g. iOS 17.5, Windows 11 Pro, macOS Sonoma"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY & PASSCODE */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-2">
                    {t('lock_type')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'pin', 'password', 'pattern'] as LockType[]).map((lt) => (
                      <button
                        key={lt}
                        type="button"
                        onClick={() => setLockType(lt)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase transition-all ${
                          lockType === lt
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lt}
                      </button>
                    ))}
                  </div>
                </div>

                {lockType !== 'none' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {lockType === 'pattern' ? t('pattern_code') : t('passcode')}
                    </label>
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder={lockType === 'pin' ? 'e.g. 1234 or 000000' : 'Device PIN / Password'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('account_lock')}
                  </label>
                  <select
                    value={accountLock}
                    onChange={(e) => setAccountLock(e.target.value as AccountLockStatus)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="unlocked">Clean / Unlocked (Customer logged out)</option>
                    <option value="locked_icloud">iCloud Activation Lock Present</option>
                    <option value="locked_frp">Google FRP / Samsung Account Lock</option>
                    <option value="locked_bios">BIOS / Firmware Password Protected</option>
                    <option value="unknown">Unknown / Untested</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONDITION CHECKLIST & INTAKE PHOTOS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {t('condition_notes_label')}
                </span>
                <span className="text-[11px] text-slate-400">
                  Click to toggle pass / fail status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pe-1">
                {[
                  { key: 'power_on', label: t('chk_power_on') },
                  { key: 'screen_cracked', label: t('chk_screen_cracked'), inverted: true },
                  { key: 'touch_functional', label: t('chk_touch_functional') },
                  { key: 'display_blemishes', label: t('chk_display_blemishes'), inverted: true },
                  { key: 'liquid_damage_indicator', label: t('chk_liquid_damage'), inverted: true },
                  { key: 'charges_properly', label: t('chk_charges_properly') },
                  { key: 'front_camera_working', label: t('chk_front_camera') },
                  { key: 'rear_camera_working', label: t('chk_rear_camera') },
                  { key: 'biometrics_working', label: t('chk_biometrics') },
                  { key: 'speaker_earpiece_working', label: t('chk_audio') },
                  { key: 'microphone_working', label: t('chk_microphone') },
                  { key: 'housing_bent_dented', label: t('chk_housing_bent'), inverted: true },
                  { key: 'buttons_functional', label: t('chk_buttons') },
                  { key: 'sim_tray_present', label: t('chk_sim_tray') },
                ].map((item) => {
                  const val = (checklist as any)[item.key];
                  const isPositive = item.inverted ? !val : val;

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleChecklist(item.key as any)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isPositive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{item.label}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isPositive ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Photo Evidence Section */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>Intake Photographic Evidence ({stagedPhotos.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Photo</span>
                  </button>
                </div>

                {stagedPhotos.length > 0 ? (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {stagedPhotos.map((photo, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 group"
                      >
                        <img
                          src={photo.dataUrl}
                          alt="Intake snap"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    No photos captured yet. Attach photos of scratches, dents, or pre-existing cracks for liability protection.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: PROBLEM & FINANCIALS */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('problem_description')} *
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the defect in detail (e.g. Touch cracked, no backlight, bootloops after liquid splash)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('accessories_received')}
                </label>
                <input
                  type="text"
                  value={accessoriesReceived}
                  onChange={(e) => setAccessoriesReceived(e.target.value)}
                  placeholder="e.g. Original 67W Charger, Protective silicone case, SIM card"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('repair_type')}
                  </label>
                  <select
                    value={repairType}
                    onChange={(e) => setRepairType(e.target.value as RepairType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="modular">{t('repair_modular')}</option>
                    <option value="board_level">{t('repair_board')}</option>
                    <option value="hybrid">{t('repair_hybrid')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('priority')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">{t('priority_low')}</option>
                    <option value="normal">{t('priority_normal')}</option>
                    <option value="high">{t('priority_high')}</option>
                    <option value="urgent">{t('priority_urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('estimated_cost')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedCost || ''}
                    onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('deposit_amount')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={depositPaid || ''}
                    onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Liability Waiver Checkbox */}
              <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="waiver"
                  checked={liabilityWaiver}
                  onChange={(e) => setLiabilityWaiver(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
                />
                <label htmlFor="waiver" className="text-xs text-slate-300 cursor-pointer">
                  {t('liability_waiver')}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/80">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <PrevIcon className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {t('cancel')}
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-950"
              >
                <span>Continue</span>
                <NextIcon className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 transition-all shadow-md shadow-emerald-950 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Creating Order...' : 'Generate Work Order'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Webcam Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={handleAddPhoto}
          defaultStage="intake"
        />
      )}
    </div>
  );
};
