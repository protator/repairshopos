use rusqlite::Connection;
use crate::error::AppError;

pub const SCHEMA_SQL: &str = r#"
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    primary_phone TEXT NOT NULL,
    secondary_phone TEXT,
    email TEXT,
    address TEXT,
    tax_id TEXT,
    communication_preference TEXT NOT NULL DEFAULT 'phone' 
        CHECK(communication_preference IN ('phone', 'sms', 'email', 'whatsapp')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(primary_phone, secondary_phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' 
        CHECK(status IN ('new', 'diagnosing', 'waiting_on_parts', 'ready', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    is_quote INTEGER NOT NULL DEFAULT 0 CHECK(is_quote IN (0, 1)),
    device_type TEXT NOT NULL DEFAULT 'smartphone'
        CHECK(device_type IN ('smartphone', 'tablet', 'laptop', 'desktop', 'console', 'wearable', 'other')),
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    device_color TEXT,
    imei TEXT,
    serial_number TEXT,
    lock_type TEXT NOT NULL DEFAULT 'none'
        CHECK(lock_type IN ('none', 'pin', 'password', 'pattern')),
    passcode TEXT,
    pattern_code TEXT,
    account_lock_status TEXT NOT NULL DEFAULT 'unknown'
        CHECK(account_lock_status IN ('unlocked', 'locked_icloud', 'locked_frp', 'locked_bios', 'unknown')),
    problem_description TEXT NOT NULL,
    accessories_received TEXT,
    hardware_specs TEXT NOT NULL DEFAULT '{}',
    condition_checklist TEXT NOT NULL DEFAULT '{}',
    liability_waiver_signed INTEGER NOT NULL DEFAULT 0 CHECK(liability_waiver_signed IN (0, 1)),
    intake_signature_path TEXT,
    repair_type TEXT NOT NULL DEFAULT 'modular' 
        CHECK(repair_type IN ('modular', 'board_level', 'hybrid')),
    diagnostics_notes TEXT,
    technician_notes TEXT,
    board_diagnostics TEXT NOT NULL DEFAULT '{}',
    estimated_cost INTEGER NOT NULL DEFAULT 0,
    subtotal_parts INTEGER NOT NULL DEFAULT 0,
    subtotal_labor INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    tax_rate_bps INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    total_price INTEGER NOT NULL DEFAULT 0,
    deposit_paid INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid'
        CHECK(payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
    payment_method TEXT
        CHECK(payment_method IN ('cash', 'card', 'transfer', 'baridi_mob', 'check')),
    warranty_days INTEGER NOT NULL DEFAULT 30,
    warranty_expiry_date TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ready_at TEXT,
    completed_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_imei ON tickets(imei);
CREATE INDEX IF NOT EXISTS idx_tickets_serial ON tickets(serial_number);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

CREATE TABLE IF NOT EXISTS ticket_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK(item_type IN ('part', 'labor', 'diagnostic', 'fee')),
    inventory_item_id INTEGER,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost INTEGER NOT NULL DEFAULT 0,
    unit_price INTEGER NOT NULL DEFAULT 0,
    total_price INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_items_ticket ON ticket_items(ticket_id);

CREATE TABLE IF NOT EXISTS ticket_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    stage TEXT NOT NULL CHECK(stage IN ('intake', 'microscope_diagnostic', 'post_repair')),
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_photos_ticket ON ticket_photos(ticket_id);

CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT NOT NULL DEFAULT 'general'
        CHECK(category IN ('screen', 'battery', 'charging_port', 'camera', 'housing', 'board_chip', 'tool_consumable', 'accessory', 'general')),
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    cost_price INTEGER NOT NULL DEFAULT 0,
    retail_price INTEGER NOT NULL DEFAULT 0,
    compatibility TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER IF NOT EXISTS trg_customers_updated_at 
AFTER UPDATE ON customers
BEGIN
    UPDATE customers SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tickets_updated_at 
AFTER UPDATE ON tickets
BEGIN
    UPDATE tickets SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_inventory_updated_at 
AFTER UPDATE ON inventory
BEGIN
    UPDATE inventory SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;
"#;

pub fn run_migrations(conn: &Connection) -> Result<(), AppError> {
    conn.execute_batch(SCHEMA_SQL)?;

    // Safe migration: Add hardware_specs column if running on older DB
    let _ = conn.execute("ALTER TABLE tickets ADD COLUMN hardware_specs TEXT NOT NULL DEFAULT '{}'", []);

    // Seed default settings
    let default_settings = [
        ("shop_name", "RepairShop OS"),
        ("shop_phone", "+213 555 123 456"),
        ("shop_email", "contact@repairshop.dz"),
        ("shop_address", "Alger, Algérie"),
        ("currency", "DZD"),
        ("tax_rate_bps", "1900"),
        ("language", "en"),
        ("warranty_days", "30"),
        ("receipt_notes", "Thank you for trusting RepairShop OS. Warranty covers replaced parts only."),
        ("logo_path", ""),
        ("operating_hours", "Sat - Thu: 09:00 - 18:00"),
    ];

    for (k, v) in default_settings.iter() {
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)",
            rusqlite::params![k, v],
        )?;
    }

    Ok(())
}
