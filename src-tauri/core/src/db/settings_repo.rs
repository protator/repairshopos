use rusqlite::{params, Connection};
use crate::error::AppError;
use crate::models::settings::ShopSettings;

pub fn get_settings(conn: &Connection) -> Result<ShopSettings, AppError> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
    let rows = stmt.query_map([], |row| {
        let key: String = row.get(0)?;
        let value: String = row.get(1)?;
        Ok((key, value))
    })?;

    let mut settings = ShopSettings::default();

    for row in rows {
        let (key, value) = row?;
        match key.as_str() {
            "shop_name" => settings.shop_name = value,
            "shop_phone" => settings.shop_phone = value,
            "shop_email" => settings.shop_email = value,
            "shop_address" => settings.shop_address = value,
            "currency" => settings.currency = value,
            "tax_rate_bps" => {
                if let Ok(v) = value.parse::<i64>() {
                    settings.tax_rate_bps = v;
                }
            }
            "language" => settings.language = value,
            "warranty_days" => {
                if let Ok(v) = value.parse::<i64>() {
                    settings.warranty_days = v;
                }
            }
            "receipt_notes" => settings.receipt_notes = value,
            "logo_path" => {
                settings.logo_path = if value.is_empty() { None } else { Some(value) };
            }
            "operating_hours" => settings.operating_hours = value,
            _ => {}
        }
    }

    Ok(settings)
}

pub fn update_settings(conn: &Connection, settings: &ShopSettings) -> Result<ShopSettings, AppError> {
    let entries = [
        ("shop_name", settings.shop_name.as_str()),
        ("shop_phone", settings.shop_phone.as_str()),
        ("shop_email", settings.shop_email.as_str()),
        ("shop_address", settings.shop_address.as_str()),
        ("currency", settings.currency.as_str()),
        ("language", settings.language.as_str()),
        ("receipt_notes", settings.receipt_notes.as_str()),
        ("logo_path", settings.logo_path.as_deref().unwrap_or("")),
        ("operating_hours", settings.operating_hours.as_str()),
    ];

    for (k, v) in entries.iter() {
        conn.execute(
            r#"
            INSERT INTO settings (key, value, updated_at)
            VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at
            "#,
            params![k, v],
        )?;
    }

    let tax_str = settings.tax_rate_bps.to_string();
    conn.execute(
        r#"
        INSERT INTO settings (key, value, updated_at)
        VALUES ('tax_rate_bps', ?1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        "#,
        params![tax_str],
    )?;

    let warranty_str = settings.warranty_days.to_string();
    conn.execute(
        r#"
        INSERT INTO settings (key, value, updated_at)
        VALUES ('warranty_days', ?1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        "#,
        params![warranty_str],
    )?;

    get_settings(conn)
}
