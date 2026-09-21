use rusqlite::{params, Connection, Row};
use crate::error::AppError;
use crate::models::customer::{CommunicationPreference, CreateCustomerPayload, Customer, UpdateCustomerPayload};

fn map_customer_row(row: &Row) -> Result<Customer, rusqlite::Error> {
    let comm_pref_str: String = row.get(7)?;
    Ok(Customer {
        id: row.get(0)?,
        name: row.get(1)?,
        primary_phone: row.get(2)?,
        secondary_phone: row.get(3)?,
        email: row.get(4)?,
        address: row.get(5)?,
        tax_id: row.get(6)?,
        communication_preference: CommunicationPreference::from_str_opt(&comm_pref_str),
        notes: row.get(8)?,
        created_at: row.get(9)?,
        updated_at: row.get(10)?,
    })
}

pub fn create_customer(conn: &Connection, payload: CreateCustomerPayload) -> Result<Customer, AppError> {
    let name = payload.name.trim();
    if name.is_empty() {
        return Err(AppError::Validation("Customer name cannot be empty".to_string()));
    }
    let phone = payload.primary_phone.trim();
    if phone.is_empty() {
        return Err(AppError::Validation("Customer primary phone cannot be empty".to_string()));
    }

    let comm_pref = payload.communication_preference.unwrap_or_default();

    conn.execute(
        r#"
        INSERT INTO customers (
            name, primary_phone, secondary_phone, email, address, tax_id, communication_preference, notes
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        "#,
        params![
            name,
            phone,
            payload.secondary_phone,
            payload.email,
            payload.address,
            payload.tax_id,
            comm_pref.as_str(),
            payload.notes
        ],
    )?;

    let last_id = conn.last_insert_rowid();
    get_customer_by_id(conn, last_id)
}

pub fn get_customer_by_id(conn: &Connection, id: i64) -> Result<Customer, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, primary_phone, secondary_phone, email, address, tax_id, 
               communication_preference, notes, created_at, updated_at
        FROM customers
        WHERE id = ?1
        "#,
    )?;

    let customer = stmt.query_row(params![id], map_customer_row)
        .map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Customer with id {} not found", id)),
            other => AppError::Database(other),
        })?;

    Ok(customer)
}

pub fn update_customer(conn: &Connection, id: i64, payload: UpdateCustomerPayload) -> Result<Customer, AppError> {
    let existing = get_customer_by_id(conn, id)?;

    let new_name = payload.name.unwrap_or(existing.name);
    let new_phone = payload.primary_phone.unwrap_or(existing.primary_phone);
    let new_secondary_phone = payload.secondary_phone.or(existing.secondary_phone);
    let new_email = payload.email.or(existing.email);
    let new_address = payload.address.or(existing.address);
    let new_tax_id = payload.tax_id.or(existing.tax_id);
    let new_comm_pref = payload.communication_preference.unwrap_or(existing.communication_preference);
    let new_notes = payload.notes.or(existing.notes);

    conn.execute(
        r#"
        UPDATE customers SET
            name = ?1,
            primary_phone = ?2,
            secondary_phone = ?3,
            email = ?4,
            address = ?5,
            tax_id = ?6,
            communication_preference = ?7,
            notes = ?8
        WHERE id = ?9
        "#,
        params![
            new_name,
            new_phone,
            new_secondary_phone,
            new_email,
            new_address,
            new_tax_id,
            new_comm_pref.as_str(),
            new_notes,
            id
        ],
    )?;

    get_customer_by_id(conn, id)
}

pub fn search_customers(conn: &Connection, query: &str) -> Result<Vec<Customer>, AppError> {
    let pattern = format!("%{}%", query.trim());
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, primary_phone, secondary_phone, email, address, tax_id, 
               communication_preference, notes, created_at, updated_at
        FROM customers
        WHERE name LIKE ?1 OR primary_phone LIKE ?1 OR secondary_phone LIKE ?1 OR email LIKE ?1
        ORDER BY id DESC
        LIMIT 50
        "#,
    )?;

    let rows = stmt.query_map(params![pattern], map_customer_row)?;
    let mut customers = Vec::new();
    for row in rows {
        customers.push(row?);
    }

    Ok(customers)
}

pub fn list_customers(conn: &Connection, limit: i64, offset: i64) -> Result<Vec<Customer>, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, primary_phone, secondary_phone, email, address, tax_id, 
               communication_preference, notes, created_at, updated_at
        FROM customers
        ORDER BY id DESC
        LIMIT ?1 OFFSET ?2
        "#,
    )?;

    let rows = stmt.query_map(params![limit, offset], map_customer_row)?;
    let mut customers = Vec::new();
    for row in rows {
        customers.push(row?);
    }

    Ok(customers)
}
