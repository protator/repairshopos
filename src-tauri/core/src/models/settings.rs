use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShopSettings {
    pub shop_name: String,
    pub shop_phone: String,
    pub shop_email: String,
    pub shop_address: String,
    pub currency: String,
    pub tax_rate_bps: i64,
    pub language: String,
    pub warranty_days: i64,
    pub receipt_notes: String,
    pub logo_path: Option<String>,
}

impl Default for ShopSettings {
    fn default() -> Self {
        Self {
            shop_name: "RepairShop OS".to_string(),
            shop_phone: "+213 555 123 456".to_string(),
            shop_email: "contact@repairshop.dz".to_string(),
            shop_address: "Alger, Algérie".to_string(),
            currency: "DZD".to_string(),
            tax_rate_bps: 1900,
            language: "en".to_string(),
            warranty_days: 30,
            receipt_notes: "Thank you for choosing us! Warranty covers serviced parts only.".to_string(),
            logo_path: None,
        }
    }
}
