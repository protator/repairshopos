use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CommunicationPreference {
    Phone,
    Sms,
    Email,
    Whatsapp,
}

impl CommunicationPreference {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Phone => "phone",
            Self::Sms => "sms",
            Self::Email => "email",
            Self::Whatsapp => "whatsapp",
        }
    }

    pub fn from_str_opt(s: &str) -> Self {
        match s {
            "sms" => Self::Sms,
            "email" => Self::Email,
            "whatsapp" => Self::Whatsapp,
            _ => Self::Phone,
        }
    }
}

impl Default for CommunicationPreference {
    fn default() -> Self {
        Self::Phone
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Customer {
    pub id: i64,
    pub name: String,
    pub primary_phone: String,
    pub secondary_phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub tax_id: Option<String>,
    pub communication_preference: CommunicationPreference,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCustomerPayload {
    pub name: String,
    pub primary_phone: String,
    pub secondary_phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub tax_id: Option<String>,
    pub communication_preference: Option<CommunicationPreference>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCustomerPayload {
    pub name: Option<String>,
    pub primary_phone: Option<String>,
    pub secondary_phone: Option<String>,
    pub email: Option<String>,
    pub address: Option<String>,
    pub tax_id: Option<String>,
    pub communication_preference: Option<CommunicationPreference>,
    pub notes: Option<String>,
}
