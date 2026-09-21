use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PartCategory {
    Screen,
    Battery,
    ChargingPort,
    Camera,
    Housing,
    BoardChip,
    ToolConsumable,
    Accessory,
    General,
}

impl PartCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Screen => "screen",
            Self::Battery => "battery",
            Self::ChargingPort => "charging_port",
            Self::Camera => "camera",
            Self::Housing => "housing",
            Self::BoardChip => "board_chip",
            Self::ToolConsumable => "tool_consumable",
            Self::Accessory => "accessory",
            Self::General => "general",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "screen" => Self::Screen,
            "battery" => Self::Battery,
            "charging_port" => Self::ChargingPort,
            "camera" => Self::Camera,
            "housing" => Self::Housing,
            "board_chip" => Self::BoardChip,
            "tool_consumable" => Self::ToolConsumable,
            "accessory" => Self::Accessory,
            _ => Self::General,
        }
    }
}

impl Default for PartCategory {
    fn default() -> Self {
        Self::General
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryItem {
    pub id: i64,
    pub name: String,
    pub sku: Option<String>,
    pub category: PartCategory,
    pub quantity: i64,
    pub low_stock_threshold: i64,
    pub cost_price: i64,
    pub retail_price: i64,
    pub compatibility: Option<String>,
    pub notes: Option<String>,
    pub is_low_stock: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateInventoryPayload {
    pub name: String,
    pub sku: Option<String>,
    pub category: Option<PartCategory>,
    pub quantity: Option<i64>,
    pub low_stock_threshold: Option<i64>,
    pub cost_price: Option<i64>,
    pub retail_price: i64,
    pub compatibility: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInventoryPayload {
    pub name: Option<String>,
    pub sku: Option<String>,
    pub category: Option<PartCategory>,
    pub quantity: Option<i64>,
    pub low_stock_threshold: Option<i64>,
    pub cost_price: Option<i64>,
    pub retail_price: Option<i64>,
    pub compatibility: Option<String>,
    pub notes: Option<String>,
}
