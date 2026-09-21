export type CommunicationPreference = 'phone' | 'sms' | 'email' | 'whatsapp';

export interface Customer {
  id: i64;
  name: string;
  primary_phone: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  tax_id?: string;
  communication_preference: CommunicationPreference;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type i64 = number;

export interface CreateCustomerPayload {
  name: string;
  primary_phone: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  tax_id?: string;
  communication_preference?: CommunicationPreference;
  notes?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  tax_id?: string;
  communication_preference?: CommunicationPreference;
  notes?: string;
}

export type TicketStatus = 'new' | 'diagnosing' | 'waiting_on_parts' | 'ready' | 'completed' | 'cancelled';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'desktop' | 'console' | 'wearable' | 'other';
export type LockType = 'none' | 'pin' | 'password' | 'pattern';
export type AccountLockStatus = 'unlocked' | 'locked_icloud' | 'locked_frp' | 'locked_bios' | 'unknown';
export type RepairType = 'modular' | 'board_level' | 'hybrid';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
export type ItemType = 'part' | 'labor' | 'diagnostic' | 'fee';

export interface ConditionChecklist {
  power_on: boolean;
  screen_cracked: boolean;
  touch_functional: boolean;
  display_blemishes: boolean;
  liquid_damage_indicator: boolean;
  charges_properly: boolean;
  front_camera_working: boolean;
  rear_camera_working: boolean;
  biometrics_working: boolean;
  speaker_earpiece_working: boolean;
  microphone_working: boolean;
  housing_bent_dented: boolean;
  buttons_functional: boolean;
  sim_tray_present: boolean;
}

export interface PowerRailMeasurement {
  rail_name: string;
  expected_voltage?: number;
  measured_voltage?: number;
  diode_mode_value?: number;
  is_shorted: boolean;
}

export interface BoardDiagnostics {
  prompt_to_boot_amp?: number;
  power_rails: PowerRailMeasurement[];
  smd_components_replaced: string[];
  donor_board_reference?: string;
  ultrasonic_cleaned: boolean;
}

export interface HardwareSpecs {
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  os_version?: string;
  battery_health?: string;
  custom_specs?: string;
}

export interface TicketKanbanCard {
  id: i64;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  device_brand: string;
  device_model: string;
  status: TicketStatus;
  priority: TicketPriority;
  is_quote: boolean;
  repair_type: RepairType;
  total_price: i64;
  deposit_paid: i64;
  created_at: string;
}

export interface TicketItem {
  id: i64;
  ticket_id: i64;
  item_type: ItemType;
  inventory_item_id?: i64;
  name: string;
  quantity: i64;
  unit_cost: i64;
  unit_price: i64;
  total_price: i64;
  created_at: string;
}

export interface TicketPhoto {
  id: i64;
  ticket_id: i64;
  stage: 'intake' | 'microscope_diagnostic' | 'post_repair';
  file_path: string;
  thumbnail_path?: string;
  notes?: string;
  created_at: string;
}

export interface TicketDetailView {
  ticket: {
    id: i64;
    ticket_number: string;
    customer_id: i64;
    status: TicketStatus;
    priority: TicketPriority;
    is_quote: boolean;
    device_type: DeviceType;
    device_brand: string;
    device_model: string;
    device_color?: string;
    imei?: string;
    serial_number?: string;
    lock_type: LockType;
    passcode?: string;
    pattern_code?: string;
    account_lock_status: AccountLockStatus;
    problem_description: string;
    accessories_received?: string;
    hardware_specs?: HardwareSpecs;
    condition_checklist: ConditionChecklist;
    liability_waiver_signed: boolean;
    intake_signature_path?: string;
    repair_type: RepairType;
    diagnostics_notes?: string;
    technician_notes?: string;
    board_diagnostics: BoardDiagnostics;
    estimated_cost: i64;
    subtotal_parts: i64;
    subtotal_labor: i64;
    discount_amount: i64;
    tax_rate_bps: i64;
    tax_amount: i64;
    total_price: i64;
    deposit_paid: i64;
    payment_status: PaymentStatus;
    payment_method?: string;
    warranty_days: i64;
    warranty_expiry_date?: string;
    created_at: string;
    updated_at: string;
    ready_at?: string;
    completed_at?: string;
  };
  customer: Customer;
  items: TicketItem[];
  photos: TicketPhoto[];
}

export interface CreateTicketPayload {
  customer_id: i64;
  priority?: TicketPriority;
  is_quote?: boolean;
  device_type?: DeviceType;
  device_brand: string;
  device_model: string;
  device_color?: string;
  imei?: string;
  serial_number?: string;
  lock_type?: LockType;
  passcode?: string;
  pattern_code?: string;
  account_lock_status?: AccountLockStatus;
  problem_description: string;
  accessories_received?: string;
  hardware_specs?: HardwareSpecs;
  condition_checklist?: ConditionChecklist;
  liability_waiver_signed?: boolean;
  repair_type?: RepairType;
  diagnostics_notes?: string;
  board_diagnostics?: BoardDiagnostics;
  estimated_cost?: i64;
  deposit_paid?: i64;
}

export interface AddItemPayload {
  item_type: ItemType;
  inventory_item_id?: i64;
  name: string;
  quantity: i64;
  unit_cost: i64;
  unit_price: i64;
}

export type PartCategory =
  | 'screen'
  | 'battery'
  | 'charging_port'
  | 'camera'
  | 'housing'
  | 'board_chip'
  | 'tool_consumable'
  | 'accessory'
  | 'general';

export interface InventoryItem {
  id: i64;
  name: string;
  sku?: string;
  category: PartCategory;
  quantity: i64;
  low_stock_threshold: i64;
  cost_price: i64;
  retail_price: i64;
  compatibility?: string;
  notes?: string;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryPayload {
  name: string;
  sku?: string;
  category?: PartCategory;
  quantity?: i64;
  low_stock_threshold?: i64;
  cost_price?: i64;
  retail_price: i64;
  compatibility?: string;
  notes?: string;
}

export interface UpdateInventoryPayload {
  name?: string;
  sku?: string;
  category?: PartCategory;
  quantity?: i64;
  low_stock_threshold?: i64;
  cost_price?: i64;
  retail_price?: i64;
  compatibility?: string;
  notes?: string;
}

export interface ShopSettings {
  shop_name: string;
  shop_phone: string;
  shop_email: string;
  shop_address: string;
  currency: string;
  tax_rate_bps: i64;
  language: 'en' | 'fr' | 'ar';
  warranty_days: i64;
  receipt_notes: string;
  logo_path?: string;
  operating_hours: string;
}

export interface LicenseInfo {
  hardware_id: string;
  is_licensed: boolean;
  license_key?: string;
  license_type: string;
  activated_at?: string;
  message: string;
}
