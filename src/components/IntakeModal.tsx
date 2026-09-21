import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  UserPlus,
  Search,
  CheckCircle2,
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
} from '../types';
import { api } from '../services/api';
import { useI18n } from '../i18n/I18nContext';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticketId: number) => void;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const { t } = useI18n();

  // Step tabs
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

  // Device & Ticket state
  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone');
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei, setImei] = useState('');

  // Lock state
  const [lockType, setLockType] = useState<LockType>('pin');
  const [passcode, setPasscode] = useState('');
  const [accountLock, setAccountLock] = useState<AccountLockStatus>('unlocked');

  // Checklist
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
  const [liabilityWaiver, setLiabilityWaiver] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const list = await api.listCustomers();
      setCustomers(list);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleSearchCustomers = async (query: string) => {
    setCustomerSearch(query);
    if (!query.trim()) {
      loadCustomers();
      return;
    }
    try {
      const res = await api.searchCustomers(query);
      setCustomers(res);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChecklist = (key: keyof ConditionChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveTicket = async () => {
    setError(null);
    setLoading(true);

    try {
      let finalCustomerId = selectedCustomer?.id;

      // If creating new customer inline
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
        setError('Please describe the device issue or reported complaint');
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
        repair_type: repairType,
        priority,
        estimated_cost: estimatedCost,
        deposit_paid: depositPaid,
        liability_waiver_signed: liabilityWaiver,
      };

      const result = await api.createTicket(payload);
      onTicketCreated(result.ticket.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{t('intake_title')}</h2>
              <p className="text-xs text-slate-400">Offline Local Ticket Generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/30 px-6 overflow-x-auto text-xs font-semibold">
          {[
            { step: 1, label: t('step_customer') },
            { step: 2, label: t('step_device') },
            { step: 3, label: t('step_security') },
            { step: 4, label: t('step_condition') },
            { step: 5, label: t('step_issue') },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step as any)}
              className={`py-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                currentStep === item.step
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* STEP 1: CUSTOMER */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {isCreatingCustomer ? t('or_create_customer') : t('select_customer')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCustomer(!isCreatingCustomer);
                    setSelectedCustomer(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>
                    {isCreatingCustomer ? t('select_customer') : t('or_create_customer')}
                  </span>
                </button>
              </div>

              {!isCreatingCustomer ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => handleSearchCustomers(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl ps-9 pe-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pe-1">
                    {customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          selectedCustomer?.id === c.id
                            ? 'bg-indigo-600/15 border-indigo-500 text-white'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{c.name}</p>
                          <p className="text-xs text-slate-400 font-mono">
                            {c.primary_phone}
                            {c.email && ` • ${c.email}`}
                          </p>
                        </div>
                        {selectedCustomer?.id === c.id && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('customer_name')} *
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      placeholder="e.g. Karim Benali"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('customer_phone')} *
                    </label>
                    <input
                      type="text"
                      value={newCustomer.primary_phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, primary_phone: e.target.value })
                      }
                      placeholder="0550 12 34 56"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('customer_secondary_phone')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.secondary_phone || ''}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, secondary_phone: e.target.value })
                      }
                      placeholder="Optional"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('customer_email')}
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email || ''}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, email: e.target.value })
                      }
                      placeholder="karim@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">
                      {t('customer_address')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.address || ''}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, address: e.target.value })
                      }
                      placeholder="Algiers, Algeria"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DEVICE SPECS */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('device_type')}
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="tablet">Tablet / iPad</option>
                  <option value="laptop">Laptop / MacBook</option>
                  <option value="desktop">Desktop / iMac</option>
                  <option value="console">Gaming Console (PS5, Switch)</option>
                  <option value="wearable">Smartwatch</option>
                  <option value="other">Other Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('device_brand')} *
                </label>
                <input
                  type="text"
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                  placeholder="e.g. Apple, Samsung, Xiaomi, HP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('device_model')} *
                </label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro Max (A2643)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('device_color')}
                </label>
                <input
                  type="text"
                  value={deviceColor}
                  onChange={(e) => setDeviceColor(e.target.value)}
                  placeholder="e.g. Space Gray, Midnight"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono">
                  {t('imei')}
                </label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="15-digit IMEI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono">
                  {t('serial_number')}
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Device Serial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>
            </div>
          )}

          {/* STEP 3: SECURITY & LOCKS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('lock_type')}
                  </label>
                  <select
                    value={lockType}
                    onChange={(e) => setLockType(e.target.value as LockType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="none">None / Device Wiped</option>
                    <option value="pin">Numeric PIN (4-6 digits)</option>
                    <option value="password">Alphanumeric Password</option>
                    <option value="pattern">Pattern Lock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('passcode')}
                  </label>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="e.g. 123456 or Pattern details"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('account_lock')}
                  </label>
                  <select
                    value={accountLock}
                    onChange={(e) => setAccountLock(e.target.value as AccountLockStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="unlocked">Unlocked / Signed Out (Safe)</option>
                    <option value="locked_icloud">Apple iCloud Active on Device</option>
                    <option value="locked_frp">Google FRP Locked</option>
                    <option value="locked_bios">BIOS / Firmware Password Protected</option>
                    <option value="unknown">Unknown / Cannot test due to power failure</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONDITION CHECKLIST */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Document pre-existing damage to protect the shop from liability.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'power_on', label: t('chk_power_on') },
                  { key: 'screen_cracked', label: t('chk_screen_cracked') },
                  { key: 'touch_functional', label: t('chk_touch_functional') },
                  { key: 'display_blemishes', label: t('chk_display_blemishes') },
                  { key: 'liquid_damage_indicator', label: t('chk_liquid_damage') },
                  { key: 'charges_properly', label: t('chk_charges_properly') },
                  { key: 'front_camera_working', label: t('chk_front_camera') },
                  { key: 'rear_camera_working', label: t('chk_rear_camera') },
                  { key: 'biometrics_working', label: t('chk_biometrics') },
                  { key: 'speaker_earpiece_working', label: t('chk_audio') },
                  { key: 'microphone_working', label: t('chk_microphone') },
                  { key: 'housing_bent_dented', label: t('chk_housing_bent') },
                  { key: 'buttons_functional', label: t('chk_buttons') },
                  { key: 'sim_tray_present', label: t('chk_sim_tray') },
                ].map(({ key, label }) => {
                  const checked = (checklist as any)[key];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleChecklist(key as any)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        checked
                          ? 'bg-slate-900 border-indigo-500/60 text-slate-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: PROBLEM & FINANCIALS */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('problem_description')} *
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Broken display, audioIC static on speaker, battery swelling..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t('accessories_received')}
                </label>
                <input
                  type="text"
                  value={accessoriesReceived}
                  onChange={(e) => setAccessoriesReceived(e.target.value)}
                  placeholder="e.g. Case, power brick, original box"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('repair_type')}
                  </label>
                  <select
                    value={repairType}
                    onChange={(e) => setRepairType(e.target.value as RepairType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="modular">{t('repair_modular')}</option>
                    <option value="board_level">{t('repair_board')}</option>
                    <option value="hybrid">{t('repair_hybrid')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('priority')}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">{t('priority_low')}</option>
                    <option value="normal">{t('priority_normal')}</option>
                    <option value="high">{t('priority_high')}</option>
                    <option value="urgent">{t('priority_urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('estimated_cost')}
                  </label>
                  <input
                    type="number"
                    value={estimatedCost || ''}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t('deposit_amount')}
                  </label>
                  <input
                    type="number"
                    value={depositPaid || ''}
                    onChange={(e) => setDepositPaid(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div
                onClick={() => setLiabilityWaiver(!liabilityWaiver)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={liabilityWaiver}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">
                  {t('liability_waiver')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveTicket}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-emerald-900/30 shadow-lg disabled:opacity-50"
              >
                {loading ? t('loading') : t('create_ticket_btn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
