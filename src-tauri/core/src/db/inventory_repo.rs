use rusqlite::{params, Connection};
use crate::error::AppError;
use crate::models::inventory::{CreateInventoryPayload, InventoryItem, PartCategory, UpdateInventoryPayload};

pub fn create_inventory_item(
    conn: &Connection,
    payload: CreateInventoryPayload,
) -> Result<InventoryItem, AppError> {
    let category = payload.category.unwrap_or_default();
    let quantity = payload.quantity.unwrap_or(0);
    let threshold = payload.low_stock_threshold.unwrap_or(5);
    let cost = payload.cost_price.unwrap_or(0);

    conn.execute(
        r#"
        INSERT INTO inventory (
            name, sku, category, quantity, low_stock_threshold,
            cost_price, retail_price, compatibility, notes
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#,
        params![
            payload.name,
            payload.sku,
            category.as_str(),
            quantity,
            threshold,
            cost,
            payload.retail_price,
            payload.compatibility,
            payload.notes
        ],
    )?;

    let id = conn.last_insert_rowid();
    get_inventory_item_by_id(conn, id)
}

pub fn get_inventory_item_by_id(conn: &Connection, id: i64) -> Result<InventoryItem, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, sku, category, quantity, low_stock_threshold,
               cost_price, retail_price, compatibility, notes, created_at, updated_at
        FROM inventory
        WHERE id = ?1
        "#,
    )?;

    let item = stmt.query_row(params![id], |row| {
        let cat_str: String = row.get(3)?;
        let qty: i64 = row.get(4)?;
        let threshold: i64 = row.get(5)?;

        Ok(InventoryItem {
            id: row.get(0)?,
            name: row.get(1)?,
            sku: row.get(2)?,
            category: PartCategory::from_str_opt(&cat_str),
            quantity: qty,
            low_stock_threshold: threshold,
            cost_price: row.get(6)?,
            retail_price: row.get(7)?,
            compatibility: row.get(8)?,
            notes: row.get(9)?,
            is_low_stock: qty <= threshold,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    }).map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Inventory item {} not found", id)),
        other => AppError::Database(other),
    })?;

    Ok(item)
}

pub fn update_inventory_item(
    conn: &Connection,
    id: i64,
    payload: UpdateInventoryPayload,
) -> Result<InventoryItem, AppError> {
    let current = get_inventory_item_by_id(conn, id)?;

    let name = payload.name.unwrap_or(current.name);
    let sku = payload.sku.or(current.sku);
    let category = payload.category.unwrap_or(current.category);
    let quantity = payload.quantity.unwrap_or(current.quantity);
    let threshold = payload.low_stock_threshold.unwrap_or(current.low_stock_threshold);
    let cost = payload.cost_price.unwrap_or(current.cost_price);
    let retail = payload.retail_price.unwrap_or(current.retail_price);
    let compatibility = payload.compatibility.or(current.compatibility);
    let notes = payload.notes.or(current.notes);

    conn.execute(
        r#"
        UPDATE inventory SET
            name = ?1, sku = ?2, category = ?3, quantity = ?4,
            low_stock_threshold = ?5, cost_price = ?6, retail_price = ?7,
            compatibility = ?8, notes = ?9
        WHERE id = ?10
        "#,
        params![
            name,
            sku,
            category.as_str(),
            quantity,
            threshold,
            cost,
            retail,
            compatibility,
            notes,
            id
        ],
    )?;

    get_inventory_item_by_id(conn, id)
}

pub fn delete_inventory_item(conn: &Connection, id: i64) -> Result<(), AppError> {
    let rows_affected = conn.execute("DELETE FROM inventory WHERE id = ?1", params![id])?;
    if rows_affected == 0 {
        return Err(AppError::NotFound(format!("Inventory item {} not found", id)));
    }
    Ok(())
}

pub fn list_inventory_items(
    conn: &Connection,
    search: Option<&str>,
    category: Option<&str>,
    low_stock_only: bool,
) -> Result<Vec<InventoryItem>, AppError> {
    let mut query = String::from(
        r#"
        SELECT id, name, sku, category, quantity, low_stock_threshold,
               cost_price, retail_price, compatibility, notes, created_at, updated_at
        FROM inventory
        WHERE 1=1
        "#,
    );

    let mut param_values: Vec<rusqlite::types::Value> = Vec::new();

    if let Some(cat) = category {
        if !cat.is_empty() && cat != "all" {
            param_values.push(rusqlite::types::Value::Text(cat.to_string()));
            query.push_str(&format!(" AND category = ?{}", param_values.len()));
        }
    }

    if let Some(s) = search {
        let trimmed = s.trim();
        if !trimmed.is_empty() {
            let pattern = format!("%{}%", trimmed);
            param_values.push(rusqlite::types::Value::Text(pattern.clone()));
            let p1 = param_values.len();
            param_values.push(rusqlite::types::Value::Text(pattern.clone()));
            let p2 = param_values.len();
            param_values.push(rusqlite::types::Value::Text(pattern));
            let p3 = param_values.len();
            query.push_str(&format!(" AND (name LIKE ?{} OR sku LIKE ?{} OR compatibility LIKE ?{})", p1, p2, p3));
        }
    }

    if low_stock_only {
        query.push_str(" AND quantity <= low_stock_threshold");
    }

    query.push_str(" ORDER BY name ASC");

    let mut stmt = conn.prepare(&query)?;
    let rows = stmt.query_map(rusqlite::params_from_iter(param_values), |row| {
        let cat_str: String = row.get(3)?;
        let qty: i64 = row.get(4)?;
        let threshold: i64 = row.get(5)?;

        Ok(InventoryItem {
            id: row.get(0)?,
            name: row.get(1)?,
            sku: row.get(2)?,
            category: PartCategory::from_str_opt(&cat_str),
            quantity: qty,
            low_stock_threshold: threshold,
            cost_price: row.get(6)?,
            retail_price: row.get(7)?,
            compatibility: row.get(8)?,
            notes: row.get(9)?,
            is_low_stock: qty <= threshold,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })?;

    let mut items = Vec::new();
    for r in rows {
        items.push(r?);
    }
    Ok(items)
}

pub fn adjust_stock(conn: &Connection, id: i64, delta: i64) -> Result<InventoryItem, AppError> {
    let current = get_inventory_item_by_id(conn, id)?;
    let new_qty = (current.quantity + delta).max(0);

    conn.execute(
        "UPDATE inventory SET quantity = ?1 WHERE id = ?2",
        params![new_qty, id],
    )?;

    get_inventory_item_by_id(conn, id)
}
