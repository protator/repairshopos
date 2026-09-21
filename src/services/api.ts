import { invoke } from '@tauri-apps/api/core';
import {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  TicketKanbanCard,
  TicketDetailView,
  CreateTicketPayload,
  TicketStatus,
  AddItemPayload,
  TicketItem,
  InventoryItem,
  CreateInventoryPayload,
  UpdateInventoryPayload,
  ShopSettings,
} from '../types';

const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

// --- Mock In-Memory Store for Web Preview Mode ---
let mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'Karim Benali',
    primary_phone: '0550 12 34 56',
    secondary_phone: '0770 98 76 54',
    email: 'karim@example.com',
    address: 'Didouche Mourad, Algiers',
    communication_preference: 'whatsapp',
    notes: 'Loyal customer, always brings iPhones',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 2,
    name: 'Amine Ziani',
    primary_phone: '0661 22 33 44',
    email: 'amine.z@gmail.com',
    address: 'Bab Ezzouar, Algiers',
    communication_preference: 'phone',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    name: 'Yacine Brahimi',
    primary_phone: '0770 11 22 33',
    communication_preference: 'sms',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

let mockInventory: InventoryItem[] = [
  {
    id: 1,
    name: 'iPhone 13 OLED Screen Assembly (OEM)',
    sku: 'SCR-IP13-OLED',
    category: 'screen',
    quantity: 6,
    low_stock_threshold: 3,
    cost_price: 8500,
    retail_price: 13000,
    compatibility: 'iPhone 13 / 13 Pro',
    notes: 'Grade A+ refurbished original',
    is_low_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Samsung S22 Ultra Battery (5000mAh)',
    sku: 'BAT-SAM-S22U',
    category: 'battery',
    quantity: 2,
    low_stock_threshold: 4,
    cost_price: 2400,
    retail_price: 4500,
    compatibility: 'Galaxy S22 Ultra (SM-S908B)',
    is_low_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Tristar / Hydra Charging IC (1612A1)',
    sku: 'CHIP-HYDRA-1612',
    category: 'board_chip',
    quantity: 15,
    low_stock_threshold: 5,
    cost_price: 800,
    retail_price: 2500,
    compatibility: 'iPhone 8 through 12 Pro Max',
    notes: 'Micro-soldering BGA chip',
    is_low_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Type-C Sub-board Dock Flex',
    sku: 'SUB-REDMI-NOTE11',
    category: 'charging_port',
    quantity: 1,
    low_stock_threshold: 3,
    cost_price: 900,
    retail_price: 2200,
    compatibility: 'Xiaomi Redmi Note 11 4G',
    is_low_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockTickets: TicketKanbanCard[] = [
  {
    id: 1,
    ticket_number: 'REP-2026-0001',
    customer_name: 'Karim Benali',
    customer_phone: '0550 12 34 56',
    device_brand: 'Apple',
    device_model: 'iPhone 13 Pro',
    status: 'new',
    priority: 'high',
    is_quote: false,
    repair_type: 'modular',
    total_price: 13000,
    deposit_paid: 2000,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    ticket_number: 'REP-2026-0002',
    customer_name: 'Amine Ziani',
    customer_phone: '0661 22 33 44',
    device_brand: 'Apple',
    device_model: 'MacBook Pro M1 14"',
    status: 'diagnosing',
    priority: 'urgent',
    is_quote: false,
    repair_type: 'board_level',
    total_price: 24000,
    deposit_paid: 5000,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 3,
    ticket_number: 'REP-2026-0003',
    customer_name: 'Yacine Brahimi',
    customer_phone: '0770 11 22 33',
    device_brand: 'Samsung',
    device_model: 'Galaxy S22 Ultra',
    status: 'waiting_on_parts',
    priority: 'normal',
    is_quote: false,
    repair_type: 'modular',
    total_price: 4500,
    deposit_paid: 0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    ticket_number: 'REP-2026-0004',
    customer_name: 'Fatima Hadj',
    customer_phone: '0558 77 88 99',
    device_brand: 'Sony',
    device_model: 'PlayStation 5',
    status: 'ready',
    priority: 'normal',
    is_quote: false,
    repair_type: 'board_level',
    total_price: 8500,
    deposit_paid: 8500,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

let mockSettings: ShopSettings = {
  shop_name: 'RepairShop OS Lab',
  shop_phone: '+213 555 123 456',
  shop_email: 'contact@repairshop.dz',
  shop_address: '08 Rue Didouche Mourad, Alger Centre',
  currency: 'DZD',
  tax_rate_bps: 1900,
  language: 'en',
  warranty_days: 30,
  receipt_notes: 'Thank you for choosing RepairShop OS! 30-day warranty applies on parts replaced. Liquid damage voids warranty.',
  logo_path: '',
};

let mockTicketDetails: Record<number, TicketDetailView> = {
  1: {
    ticket: {
      id: 1,
      ticket_number: 'REP-2026-0001',
      customer_id: 1,
      status: 'new',
      priority: 'high',
      is_quote: false,
      device_type: 'smartphone',
      device_brand: 'Apple',
      device_model: 'iPhone 13 Pro',
      device_color: 'Sierra Blue',
      imei: '354890123456789',
      serial_number: 'F2LW9882K10',
      lock_type: 'pin',
      passcode: '123456',
      account_lock_status: 'unlocked',
      problem_description: 'Dropped from 2nd floor, screen fully shattered and touch unresponsive. Needs urgent replacement.',
      accessories_received: 'Protective case and charger cable',
      condition_checklist: {
        power_on: true,
        screen_cracked: true,
        touch_functional: false,
        display_blemishes: true,
        liquid_damage_indicator: false,
        charges_properly: true,
        front_camera_working: true,
        rear_camera_working: true,
        biometrics_working: true,
        speaker_earpiece_working: true,
        microphone_working: true,
        housing_bent_dented: true,
        buttons_functional: true,
        sim_tray_present: true,
      },
      liability_waiver_signed: true,
      repair_type: 'modular',
      board_diagnostics: {
        power_rails: [],
        smd_components_replaced: [],
        ultrasonic_cleaned: false,
      },
      estimated_cost: 13000,
      subtotal_parts: 10000,
      subtotal_labor: 3000,
      discount_amount: 0,
      tax_rate_bps: 1900,
      tax_amount: 0,
      total_price: 13000,
      deposit_paid: 2000,
      payment_status: 'partially_paid',
      warranty_days: 30,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    customer: mockCustomers[0],
    items: [
      {
        id: 101,
        ticket_id: 1,
        item_type: 'part',
        inventory_item_id: 1,
        name: 'iPhone 13 OLED Screen Assembly (OEM)',
        quantity: 1,
        unit_cost: 8500,
        unit_price: 10000,
        total_price: 10000,
        created_at: new Date().toISOString(),
      },
      {
        id: 102,
        ticket_id: 1,
        item_type: 'labor',
        name: 'Display Replacement & TrueTone Transfer Labor',
        quantity: 1,
        unit_cost: 0,
        unit_price: 3000,
        total_price: 3000,
        created_at: new Date().toISOString(),
      },
    ],
    photos: [],
  },
};

// --- Exported API Services ---

export const api = {
  // Customers
  async listCustomers(limit = 100, offset = 0): Promise<Customer[]> {
    if (isTauri) return invoke('list_customers', { limit, offset });
    return [...mockCustomers];
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    if (isTauri) return invoke('search_customers', { query });
    const q = query.toLowerCase();
    return mockCustomers.filter(c => c.name.toLowerCase().includes(q) || c.primary_phone.includes(q));
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    if (isTauri) return invoke('create_customer', { payload });
    const newCust: Customer = {
      id: Date.now(),
      name: payload.name,
      primary_phone: payload.primary_phone,
      secondary_phone: payload.secondary_phone,
      email: payload.email,
      address: payload.address,
      tax_id: payload.tax_id,
      communication_preference: payload.communication_preference || 'phone',
      notes: payload.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCustomers.unshift(newCust);
    return newCust;
  },

  async updateCustomer(customerId: number, payload: UpdateCustomerPayload): Promise<Customer> {
    if (isTauri) return invoke('update_customer', { customerId, payload });
    const idx = mockCustomers.findIndex(c => c.id === customerId);
    if (idx === -1) throw new Error('Customer not found');
    mockCustomers[idx] = { ...mockCustomers[idx], ...payload, updated_at: new Date().toISOString() };
    return mockCustomers[idx];
  },

  // Tickets
  async listKanbanTickets(): Promise<TicketKanbanCard[]> {
    if (isTauri) return invoke('list_kanban_tickets');
    return [...mockTickets];
  },

  async searchTickets(query: string): Promise<TicketKanbanCard[]> {
    if (isTauri) return invoke('search_tickets', { query });
    const q = query.toLowerCase();
    return mockTickets.filter(
      t =>
        t.ticket_number.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_phone.includes(q) ||
        t.device_brand.toLowerCase().includes(q) ||
        t.device_model.toLowerCase().includes(q)
    );
  },

  async getTicketDetails(ticketId: number): Promise<TicketDetailView> {
    if (isTauri) return invoke('get_ticket_details', { ticketId });
    if (mockTicketDetails[ticketId]) return mockTicketDetails[ticketId];
    const ticketCard = mockTickets.find(t => t.id === ticketId);
    const customer = mockCustomers[0];
    return {
      ticket: {
        id: ticketId,
        ticket_number: ticketCard?.ticket_number || `REP-${ticketId}`,
        customer_id: customer.id,
        status: ticketCard?.status || 'new',
        priority: ticketCard?.priority || 'normal',
        is_quote: false,
        device_type: 'smartphone',
        device_brand: ticketCard?.device_brand || 'Apple',
        device_model: ticketCard?.device_model || 'Device',
        lock_type: 'pin',
        passcode: '0000',
        account_lock_status: 'unlocked',
        problem_description: 'Device service inspection',
        condition_checklist: {
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
        },
        liability_waiver_signed: true,
        repair_type: ticketCard?.repair_type || 'modular',
        board_diagnostics: { power_rails: [], smd_components_replaced: [], ultrasonic_cleaned: false },
        estimated_cost: ticketCard?.total_price || 0,
        subtotal_parts: ticketCard?.total_price || 0,
        subtotal_labor: 0,
        discount_amount: 0,
        tax_rate_bps: 1900,
        tax_amount: 0,
        total_price: ticketCard?.total_price || 0,
        deposit_paid: ticketCard?.deposit_paid || 0,
        payment_status: 'unpaid',
        warranty_days: 30,
        created_at: ticketCard?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      customer,
      items: [],
      photos: [],
    };
  },

  async createTicket(payload: CreateTicketPayload): Promise<TicketDetailView> {
    if (isTauri) return invoke('create_ticket', { payload });
    const id = Date.now();
    const customer = mockCustomers.find(c => c.id === payload.customer_id) || mockCustomers[0];
    const ticketNumber = `REP-2026-${String(mockTickets.length + 1).padStart(4, '0')}`;
    
    const newCard: TicketKanbanCard = {
      id,
      ticket_number: ticketNumber,
      customer_name: customer.name,
      customer_phone: customer.primary_phone,
      device_brand: payload.device_brand,
      device_model: payload.device_model,
      status: 'new',
      priority: payload.priority || 'normal',
      is_quote: payload.is_quote || false,
      repair_type: payload.repair_type || 'modular',
      total_price: payload.estimated_cost || 0,
      deposit_paid: payload.deposit_paid || 0,
      created_at: new Date().toISOString(),
    };
    mockTickets.unshift(newCard);

    const detail: TicketDetailView = {
      ticket: {
        id,
        ticket_number: ticketNumber,
        customer_id: customer.id,
        status: 'new',
        priority: payload.priority || 'normal',
        is_quote: payload.is_quote || false,
        device_type: payload.device_type || 'smartphone',
        device_brand: payload.device_brand,
        device_model: payload.device_model,
        device_color: payload.device_color,
        imei: payload.imei,
        serial_number: payload.serial_number,
        lock_type: payload.lock_type || 'none',
        passcode: payload.passcode,
        pattern_code: payload.pattern_code,
        account_lock_status: payload.account_lock_status || 'unknown',
        problem_description: payload.problem_description,
        accessories_received: payload.accessories_received,
        condition_checklist: payload.condition_checklist || {
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
        },
        liability_waiver_signed: payload.liability_waiver_signed ?? true,
        repair_type: payload.repair_type || 'modular',
        diagnostics_notes: payload.diagnostics_notes,
        board_diagnostics: payload.board_diagnostics || { power_rails: [], smd_components_replaced: [], ultrasonic_cleaned: false },
        estimated_cost: payload.estimated_cost || 0,
        subtotal_parts: 0,
        subtotal_labor: 0,
        discount_amount: 0,
        tax_rate_bps: 1900,
        tax_amount: 0,
        total_price: payload.estimated_cost || 0,
        deposit_paid: payload.deposit_paid || 0,
        payment_status: 'unpaid',
        warranty_days: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      customer,
      items: [],
      photos: [],
    };
    mockTicketDetails[id] = detail;
    return detail;
  },

  async updateTicketStatus(ticketId: number, status: TicketStatus): Promise<void> {
    if (isTauri) return invoke('update_ticket_status', { ticketId, status });
    const card = mockTickets.find(t => t.id === ticketId);
    if (card) card.status = status;
    if (mockTicketDetails[ticketId]) {
      mockTicketDetails[ticketId].ticket.status = status;
    }
  },

  async addTicketItem(ticketId: number, payload: AddItemPayload): Promise<TicketItem> {
    if (isTauri) return invoke('add_ticket_item', { ticketId, payload });
    const item: TicketItem = {
      id: Date.now(),
      ticket_id: ticketId,
      item_type: payload.item_type,
      inventory_item_id: payload.inventory_item_id,
      name: payload.name,
      quantity: payload.quantity,
      unit_cost: payload.unit_cost,
      unit_price: payload.unit_price,
      total_price: payload.quantity * payload.unit_price,
      created_at: new Date().toISOString(),
    };
    if (mockTicketDetails[ticketId]) {
      mockTicketDetails[ticketId].items.push(item);
      const total = mockTicketDetails[ticketId].items.reduce((sum, it) => sum + it.total_price, 0);
      mockTicketDetails[ticketId].ticket.total_price = total;
    }
    const card = mockTickets.find(t => t.id === ticketId);
    if (card) {
      card.total_price += item.total_price;
    }
    return item;
  },

  async deleteTicketItem(itemId: number, ticketId: number): Promise<void> {
    if (isTauri) return invoke('delete_ticket_item', { itemId });
    if (mockTicketDetails[ticketId]) {
      mockTicketDetails[ticketId].items = mockTicketDetails[ticketId].items.filter(it => it.id !== itemId);
      const total = mockTicketDetails[ticketId].items.reduce((sum, it) => sum + it.total_price, 0);
      mockTicketDetails[ticketId].ticket.total_price = total;
    }
  },

  // Inventory
  async listInventory(search?: string, category?: string, lowStockOnly?: boolean): Promise<InventoryItem[]> {
    if (isTauri) return invoke('list_inventory_items', { search, category, lowStockOnly });
    let res = [...mockInventory];
    if (category && category !== 'all') {
      res = res.filter(it => it.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(it => it.name.toLowerCase().includes(q) || (it.sku && it.sku.toLowerCase().includes(q)));
    }
    if (lowStockOnly) {
      res = res.filter(it => it.quantity <= it.low_stock_threshold);
    }
    return res;
  },

  async createInventoryItem(payload: CreateInventoryPayload): Promise<InventoryItem> {
    if (isTauri) return invoke('create_inventory_item', { payload });
    const item: InventoryItem = {
      id: Date.now(),
      name: payload.name,
      sku: payload.sku,
      category: payload.category || 'general',
      quantity: payload.quantity || 0,
      low_stock_threshold: payload.low_stock_threshold || 5,
      cost_price: payload.cost_price || 0,
      retail_price: payload.retail_price,
      compatibility: payload.compatibility,
      notes: payload.notes,
      is_low_stock: (payload.quantity || 0) <= (payload.low_stock_threshold || 5),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockInventory.unshift(item);
    return item;
  },

  async updateInventoryItem(id: number, payload: UpdateInventoryPayload): Promise<InventoryItem> {
    if (isTauri) return invoke('update_inventory_item', { id, payload });
    const idx = mockInventory.findIndex(it => it.id === id);
    if (idx === -1) throw new Error('Inventory item not found');
    mockInventory[idx] = {
      ...mockInventory[idx],
      ...payload,
      is_low_stock: (payload.quantity ?? mockInventory[idx].quantity) <= (payload.low_stock_threshold ?? mockInventory[idx].low_stock_threshold),
      updated_at: new Date().toISOString(),
    };
    return mockInventory[idx];
  },

  async adjustInventoryStock(id: number, delta: number): Promise<InventoryItem> {
    if (isTauri) return invoke('adjust_inventory_stock', { id, delta });
    const item = mockInventory.find(it => it.id === id);
    if (!item) throw new Error('Item not found');
    item.quantity = Math.max(0, item.quantity + delta);
    item.is_low_stock = item.quantity <= item.low_stock_threshold;
    item.updated_at = new Date().toISOString();
    return item;
  },

  async deleteInventoryItem(id: number): Promise<void> {
    if (isTauri) return invoke('delete_inventory_item', { id });
    mockInventory = mockInventory.filter(it => it.id !== id);
  },

  // Settings
  async getSettings(): Promise<ShopSettings> {
    if (isTauri) return invoke('get_shop_settings');
    return { ...mockSettings };
  },

  async updateSettings(settings: ShopSettings): Promise<ShopSettings> {
    if (isTauri) return invoke('update_shop_settings', { settings });
    mockSettings = { ...settings };
    return { ...mockSettings };
  },
};
