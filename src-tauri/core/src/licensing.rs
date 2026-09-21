use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use crate::error::AppError;

const LICENSE_SALT: &str = "REPAIRSHOPOS_COMMERCIAL_OFFLINE_SECRET_2026";
const MASTER_DEV_KEY: &str = "RSOS-DEV-MASTER-2026-DZ";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub hardware_id: String,
    pub is_licensed: bool,
    pub license_key: Option<String>,
    pub license_type: String, // "commercial", "developer", "unlicensed"
    pub activated_at: Option<String>,
    pub message: String,
}

/// Computes or retrieves a unique hardware identifier (HWID) for this machine.
pub fn get_hardware_id() -> String {
    // 1. Try reading standard Linux machine ID
    let raw_id = std::fs::read_to_string("/etc/machine-id")
        .or_else(|_| std::fs::read_to_string("/var/lib/dbus/machine-id"))
        .unwrap_or_else(|_| {
            // Fallback: system hostname + target os
            let host = std::env::var("HOSTNAME").unwrap_or_else(|_| "unknown-host".to_string());
            let user = std::env::var("USER").unwrap_or_else(|_| "user".to_string());
            format!("{}-{}-{}", std::env::consts::OS, host, user)
        });

    let mut hasher = Sha256::new();
    hasher.update(b"RepairShopOS-HWID-Seed-");
    hasher.update(raw_id.trim().as_bytes());
    let result = hasher.finalize();
    let hex_str = format!("{:X}", result);

    // Format into clean blocks: RSOS-XXXX-XXXX-XXXX
    let part1 = &hex_str[0..4];
    let part2 = &hex_str[4..8];
    let part3 = &hex_str[8..12];

    format!("RSOS-{}-{}-{}", part1, part2, part3)
}

/// Deterministically generates an offline activation key for a given HWID.
pub fn generate_license_key(hwid: &str) -> String {
    let clean_hwid = hwid.trim().to_uppercase();
    let mut hasher = Sha256::new();
    hasher.update(LICENSE_SALT.as_bytes());
    hasher.update(b":");
    hasher.update(clean_hwid.as_bytes());
    let result = hasher.finalize();
    let hex_str = format!("{:X}", result);

    let k1 = &hex_str[0..4];
    let k2 = &hex_str[4..8];
    let k3 = &hex_str[8..12];
    let k4 = &hex_str[12..16];

    format!("ACT-{}-{}-{}-{}", k1, k2, k3, k4)
}

/// Verifies whether an activation key is valid for the specified hardware ID offline.
pub fn verify_license_key(hwid: &str, key: &str) -> bool {
    let clean_key = key.trim().to_uppercase();
    if clean_key == MASTER_DEV_KEY {
        return true;
    }
    let expected = generate_license_key(hwid);
    clean_key == expected
}

/// Retrieves the current licensing status from the SQLite settings table.
pub fn get_license_info(conn: &Connection) -> Result<LicenseInfo, AppError> {
    let hwid = get_hardware_id();

    let key_opt: Option<String> = conn
        .query_row(
            "SELECT value FROM settings WHERE key = 'license_key'",
            [],
            |row| row.get::<_, String>(0),
        )
        .ok()
        .filter(|s: &String| !s.trim().is_empty());

    let activated_at_opt: Option<String> = conn
        .query_row(
            "SELECT value FROM settings WHERE key = 'license_activated_at'",
            [],
            |row| row.get::<_, String>(0),
        )
        .ok()
        .filter(|s: &String| !s.trim().is_empty());

    if let Some(key) = &key_opt {
        if verify_license_key(&hwid, key) {
            let license_type = if key.trim().to_uppercase() == MASTER_DEV_KEY {
                "developer".to_string()
            } else {
                "commercial".to_string()
            };

            return Ok(LicenseInfo {
                hardware_id: hwid,
                is_licensed: true,
                license_key: Some(key.clone()),
                license_type,
                activated_at: activated_at_opt,
                message: "Offline Commercial License Active".to_string(),
            });
        }
    }

    Ok(LicenseInfo {
        hardware_id: hwid,
        is_licensed: false,
        license_key: key_opt,
        license_type: "unlicensed".to_string(),
        activated_at: None,
        message: "No active offline license key. Please activate with your vendor-provided key.".to_string(),
    })
}

/// Validates and records an offline activation key into SQLite settings.
pub fn activate_license(conn: &Connection, key: &str) -> Result<LicenseInfo, AppError> {
    let hwid = get_hardware_id();
    let clean_key = key.trim().to_uppercase();

    if !verify_license_key(&hwid, &clean_key) {
        return Err(AppError::Validation(format!(
            "Invalid activation key for Machine ID: {}. Please check with your vendor.",
            hwid
        )));
    }

    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        r#"
        INSERT INTO settings (key, value, updated_at)
        VALUES ('license_key', ?1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        "#,
        params![clean_key],
    )?;

    conn.execute(
        r#"
        INSERT INTO settings (key, value, updated_at)
        VALUES ('license_activated_at', ?1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        "#,
        params![now],
    )?;

    get_license_info(conn)
}
