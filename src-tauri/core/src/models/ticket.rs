use serde::{Deserialize, Serialize};
use super::customer::Customer;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TicketStatus {
    New,
    Diagnosing,
    WaitingOnParts,
    Ready,
    Completed,
    Cancelled,
}

impl TicketStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::New => "new",
            Self::Diagnosing => "diagnosing",
            Self::WaitingOnParts => "waiting_on_parts",
            Self::Ready => "ready",
            Self::Completed => "completed",
            Self::Cancelled => "cancelled",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "diagnosing" => Self::Diagnosing,
            "waiting_on_parts" => Self::WaitingOnParts,
            "ready" => Self::Ready,
            "completed" => Self::Completed,
            "cancelled" => Self::Cancelled,
            _ => Self::New,
        }
    }
}

impl Default for TicketStatus {
    fn default() -> Self {
        Self::New
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TicketPriority {
    Low,
    Normal,
    High,
    Urgent,
}

impl TicketPriority {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Normal => "normal",
            Self::High => "high",
            Self::Urgent => "urgent",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "low" => Self::Low,
            "high" => Self::High,
            "urgent" => Self::Urgent,
            _ => Self::Normal,
        }
    }
}

impl Default for TicketPriority {
    fn default() -> Self {
        Self::Normal
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DeviceType {
    Smartphone,
    Tablet,
    Laptop,
    Desktop,
    Console,
    Wearable,
    Other,
}

impl DeviceType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Smartphone => "smartphone",
            Self::Tablet => "tablet",
            Self::Laptop => "laptop",
            Self::Desktop => "desktop",
            Self::Console => "console",
            Self::Wearable => "wearable",
            Self::Other => "other",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "tablet" => Self::Tablet,
            "laptop" => Self::Laptop,
            "desktop" => Self::Desktop,
            "console" => Self::Console,
            "wearable" => Self::Wearable,
            "other" => Self::Other,
            _ => Self::Smartphone,
        }
    }
}

impl Default for DeviceType {
    fn default() -> Self {
        Self::Smartphone
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LockType {
    None,
    Pin,
    Password,
    Pattern,
}

impl LockType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::None => "none",
            Self::Pin => "pin",
            Self::Password => "password",
            Self::Pattern => "pattern",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "pin" => Self::Pin,
            "password" => Self::Password,
            "pattern" => Self::Pattern,
            _ => Self::None,
        }
    }
}

impl Default for LockType {
    fn default() -> Self {
        Self::None
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountLockStatus {
    Unlocked,
    LockedIcloud,
    LockedFrp,
    LockedBios,
    Unknown,
}

impl AccountLockStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Unlocked => "unlocked",
            Self::LockedIcloud => "locked_icloud",
            Self::LockedFrp => "locked_frp",
            Self::LockedBios => "locked_bios",
            Self::Unknown => "unknown",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "unlocked" => Self::Unlocked,
            "locked_icloud" => Self::LockedIcloud,
            "locked_frp" => Self::LockedFrp,
            "locked_bios" => Self::LockedBios,
            _ => Self::Unknown,
        }
    }
}

impl Default for AccountLockStatus {
    fn default() -> Self {
        Self::Unknown
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RepairType {
    Modular,
    BoardLevel,
    Hybrid,
}

impl RepairType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Modular => "modular",
            Self::BoardLevel => "board_level",
            Self::Hybrid => "hybrid",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "board_level" => Self::BoardLevel,
            "hybrid" => Self::Hybrid,
            _ => Self::Modular,
        }
    }
}

impl Default for RepairType {
    fn default() -> Self {
        Self::Modular
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentStatus {
    Unpaid,
    PartiallyPaid,
    Paid,
    Refunded,
}

impl PaymentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Unpaid => "unpaid",
            Self::PartiallyPaid => "partially_paid",
            Self::Paid => "paid",
            Self::Refunded => "refunded",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "partially_paid" => Self::PartiallyPaid,
            "paid" => Self::Paid,
            "refunded" => Self::Refunded,
            _ => Self::Unpaid,
        }
    }
}

impl Default for PaymentStatus {
    fn default() -> Self {
        Self::Unpaid
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentMethod {
    Cash,
    Card,
    Transfer,
    BaridiMob,
    Check,
}

impl PaymentMethod {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Cash => "cash",
            Self::Card => "card",
            Self::Transfer => "transfer",
            Self::BaridiMob => "baridi_mob",
            Self::Check => "check",
        }
    }

    pub fn from_str_opt(s: &str) -> Option<Self> {
        match s {
            "cash" => Some(Self::Cash),
            "card" => Some(Self::Card),
            "transfer" => Some(Self::Transfer),
            "baridi_mob" => Some(Self::BaridiMob),
            "check" => Some(Self::Check),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ItemType {
    Part,
    Labor,
    Diagnostic,
    Fee,
}

impl ItemType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Part => "part",
            Self::Labor => "labor",
            Self::Diagnostic => "diagnostic",
            Self::Fee => "fee",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "labor" => Self::Labor,
            "diagnostic" => Self::Diagnostic,
            "fee" => Self::Fee,
            _ => Self::Part,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PhotoStage {
    Intake,
    MicroscopeDiagnostic,
    PostRepair,
}

impl PhotoStage {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Intake => "intake",
            Self::MicroscopeDiagnostic => "microscope_diagnostic",
            Self::PostRepair => "post_repair",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "microscope_diagnostic" => Self::MicroscopeDiagnostic,
            "post_repair" => Self::PostRepair,
            _ => Self::Intake,
        }
    }
}

// --- Specialized Diagnostics & Intake Structures ---

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ConditionChecklist {
    pub power_on: bool,
    pub screen_cracked: bool,
    pub display_defect: bool,
    pub housing_damaged: bool,
    pub liquid_damage: bool,
    pub touch_id_face_id: bool,
    pub front_camera: bool,
    pub rear_camera: bool,
    pub charging_port: bool,
    pub audio_mic_speaker: bool,
    pub wifi_cellular: bool,
    pub missing_screws: bool,
    pub extra_observations: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PowerRailMeasurement {
    pub rail_name: String,
    pub expected_voltage: Option<f32>,
    pub measured_voltage: Option<f32>,
    pub diode_mode_value: Option<f32>,
    pub is_shorted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BoardDiagnostics {
    pub prompt_to_boot_amp: Option<f32>,
    pub power_rails: Vec<PowerRailMeasurement>,
    pub smd_components_replaced: Vec<String>,
    pub donor_board_reference: Option<String>,
    pub ultrasonic_cleaned: bool,
}

// --- Ticket Entities ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ticket {
    pub id: i64,
    pub ticket_number: String,
    pub customer_id: i64,

    pub status: TicketStatus,
    pub priority: TicketPriority,
    pub is_quote: bool,

    pub device_type: DeviceType,
    pub device_brand: String,
    pub device_model: String,
    pub device_color: Option<String>,
    pub imei: Option<String>,
    pub serial_number: Option<String>,

    pub lock_type: LockType,
    pub passcode: Option<String>,
    pub pattern_code: Option<String>,
    pub account_lock_status: AccountLockStatus,

    pub problem_description: String,
    pub accessories_received: Option<String>,
    pub condition_checklist: ConditionChecklist,
    pub liability_waiver_signed: bool,
    pub intake_signature_path: Option<String>,

    pub repair_type: RepairType,
    pub diagnostics_notes: Option<String>,
    pub technician_notes: Option<String>,
    pub board_diagnostics: BoardDiagnostics,

    pub estimated_cost: i64,
    pub subtotal_parts: i64,
    pub subtotal_labor: i64,
    pub discount_amount: i64,
    pub tax_rate_bps: i64,
    pub tax_amount: i64,
    pub total_price: i64,
    pub deposit_paid: i64,
    pub payment_status: PaymentStatus,
    pub payment_method: Option<PaymentMethod>,

    pub warranty_days: i64,
    pub warranty_expiry_date: Option<String>,

    pub created_at: String,
    pub updated_at: String,
    pub ready_at: Option<String>,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketItem {
    pub id: i64,
    pub ticket_id: i64,
    pub item_type: ItemType,
    pub inventory_item_id: Option<i64>,
    pub name: String,
    pub quantity: i64,
    pub unit_cost: i64,
    pub unit_price: i64,
    pub total_price: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketPhoto {
    pub id: i64,
    pub ticket_id: i64,
    pub stage: PhotoStage,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTicketPayload {
    pub customer_id: i64,
    pub priority: Option<TicketPriority>,
    pub is_quote: Option<bool>,

    pub device_type: Option<DeviceType>,
    pub device_brand: String,
    pub device_model: String,
    pub device_color: Option<String>,
    pub imei: Option<String>,
    pub serial_number: Option<String>,

    pub lock_type: Option<LockType>,
    pub passcode: Option<String>,
    pub pattern_code: Option<String>,
    pub account_lock_status: Option<AccountLockStatus>,

    pub problem_description: String,
    pub accessories_received: Option<String>,
    pub condition_checklist: Option<ConditionChecklist>,
    pub liability_waiver_signed: Option<bool>,

    pub repair_type: Option<RepairType>,
    pub diagnostics_notes: Option<String>,
    pub board_diagnostics: Option<BoardDiagnostics>,

    pub estimated_cost: Option<i64>,
    pub deposit_paid: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddItemPayload {
    pub item_type: ItemType,
    pub inventory_item_id: Option<i64>,
    pub name: String,
    pub quantity: i64,
    pub unit_cost: i64,
    pub unit_price: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketKanbanCard {
    pub id: i64,
    pub ticket_number: String,
    pub customer_name: String,
    pub customer_phone: String,
    pub device_brand: String,
    pub device_model: String,
    pub status: TicketStatus,
    pub priority: TicketPriority,
    pub is_quote: bool,
    pub repair_type: RepairType,
    pub total_price: i64,
    pub deposit_paid: i64,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketDetailView {
    pub ticket: Ticket,
    pub customer: Customer,
    pub items: Vec<TicketItem>,
    pub photos: Vec<TicketPhoto>,
}
