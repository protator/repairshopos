use rusqlite::{params, Connection, Row};
use crate::error::AppError;
use crate::models::ticket::*;
use crate::db::customer_repo::get_customer_by_id;

pub fn generate_ticket_number(conn: &Connection) -> Result<String, AppError> {
    let year = chrono::Utc::now().format("%Y").to_string();
    let prefix = format!("TK-{}-", year);
    
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM tickets WHERE ticket_number LIKE ?1",
        params![format!("{}%", prefix)],
        |r| r.get(0),
    )?;

    let mut seq = count + 1;
    loop {
        let candidate = format!("{}{:04}", prefix, seq);
        let exists: i64 = conn.query_row(
            "SELECT COUNT(*) FROM tickets WHERE ticket_number = ?1",
            params![candidate],
            |r| r.get(0),
        )?;
        if exists == 0 {
            return Ok(candidate);
        }
        seq += 1;
    }
}

fn map_ticket_row(row: &Row) -> Result<Ticket, rusqlite::Error> {
    let status_str: String = row.get(3)?;
    let priority_str: String = row.get(4)?;
    let is_quote_int: i64 = row.get(5)?;
    let dev_type_str: String = row.get(6)?;
    let lock_type_str: String = row.get(12)?;
    let acct_lock_str: String = row.get(15)?;
    let hw_specs_str: String = row.get(18).unwrap_or_else(|_| "{}".to_string());
    let checklist_str: String = row.get(19)?;
    let waiver_int: i64 = row.get(20)?;
    let repair_type_str: String = row.get(22)?;
    let board_diag_str: String = row.get(25)?;
    let pay_status_str: String = row.get(34)?;
    let pay_method_opt: Option<String> = row.get(35)?;

    let hardware_specs: HardwareSpecs = serde_json::from_str(&hw_specs_str)
        .unwrap_or_default();
    let condition_checklist: ConditionChecklist = serde_json::from_str(&checklist_str)
        .unwrap_or_default();
    let board_diagnostics: BoardDiagnostics = serde_json::from_str(&board_diag_str)
        .unwrap_or_default();

    Ok(Ticket {
        id: row.get(0)?,
        ticket_number: row.get(1)?,
        customer_id: row.get(2)?,
        status: TicketStatus::from_str_opt(&status_str),
        priority: TicketPriority::from_str_opt(&priority_str),
        is_quote: is_quote_int != 0,
        device_type: DeviceType::from_str_opt(&dev_type_str),
        device_brand: row.get(7)?,
        device_model: row.get(8)?,
        device_color: row.get(9)?,
        imei: row.get(10)?,
        serial_number: row.get(11)?,
        lock_type: LockType::from_str_opt(&lock_type_str),
        passcode: row.get(13)?,
        pattern_code: row.get(14)?,
        account_lock_status: AccountLockStatus::from_str_opt(&acct_lock_str),
        problem_description: row.get(16)?,
        accessories_received: row.get(17)?,
        hardware_specs,
        condition_checklist,
        liability_waiver_signed: waiver_int != 0,
        intake_signature_path: row.get(21)?,
        repair_type: RepairType::from_str_opt(&repair_type_str),
        diagnostics_notes: row.get(23)?,
        technician_notes: row.get(24)?,
        board_diagnostics,
        estimated_cost: row.get(26)?,
        subtotal_parts: row.get(27)?,
        subtotal_labor: row.get(28)?,
        discount_amount: row.get(29)?,
        tax_rate_bps: row.get(30)?,
        tax_amount: row.get(31)?,
        total_price: row.get(32)?,
        deposit_paid: row.get(33)?,
        payment_status: PaymentStatus::from_str_opt(&pay_status_str),
        payment_method: pay_method_opt.as_deref().and_then(PaymentMethod::from_str_opt),
        warranty_days: row.get(36)?,
        warranty_expiry_date: row.get(37)?,
        created_at: row.get(38)?,
        updated_at: row.get(39)?,
        ready_at: row.get(40)?,
        completed_at: row.get(41)?,
    })
}

pub fn create_ticket(conn: &Connection, payload: CreateTicketPayload) -> Result<Ticket, AppError> {
    // Validate customer exists
    let _ = get_customer_by_id(conn, payload.customer_id)?;

    if payload.problem_description.trim().is_empty() {
        return Err(AppError::Validation("Problem description cannot be empty".to_string()));
    }

    let ticket_number = generate_ticket_number(conn)?;
    let priority = payload.priority.unwrap_or_default();
    let is_quote = if payload.is_quote.unwrap_or(false) { 1 } else { 0 };
    let device_type = payload.device_type.unwrap_or_default();
    let lock_type = payload.lock_type.unwrap_or_default();
    let account_lock = payload.account_lock_status.unwrap_or_default();
    let repair_type = payload.repair_type.unwrap_or_default();
    let waiver = if payload.liability_waiver_signed.unwrap_or(false) { 1 } else { 0 };

    let hw_specs_json = serde_json::to_string(&payload.hardware_specs.unwrap_or_default())?;
    let checklist_json = serde_json::to_string(&payload.condition_checklist.unwrap_or_default())?;
    let board_diag_json = serde_json::to_string(&payload.board_diagnostics.unwrap_or_default())?;

    conn.execute(
        r#"
        INSERT INTO tickets (
            ticket_number, customer_id, priority, is_quote, device_type, device_brand,
            device_model, device_color, imei, serial_number, lock_type, passcode,
            pattern_code, account_lock_status, problem_description, accessories_received,
            hardware_specs, condition_checklist, liability_waiver_signed, repair_type,
            diagnostics_notes, board_diagnostics, estimated_cost, deposit_paid
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
            ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24
        )
        "#,
        params![
            ticket_number,
            payload.customer_id,
            priority.as_str(),
            is_quote,
            device_type.as_str(),
            payload.device_brand,
            payload.device_model,
            payload.device_color,
            payload.imei,
            payload.serial_number,
            lock_type.as_str(),
            payload.passcode,
            payload.pattern_code,
            account_lock.as_str(),
            payload.problem_description,
            payload.accessories_received,
            hw_specs_json,
            checklist_json,
            waiver,
            repair_type.as_str(),
            payload.diagnostics_notes,
            board_diag_json,
            payload.estimated_cost.unwrap_or(0),
            payload.deposit_paid.unwrap_or(0)
        ],
    )?;

    let last_id = conn.last_insert_rowid();
    get_ticket_by_id(conn, last_id)
}

pub fn get_ticket_by_id(conn: &Connection, id: i64) -> Result<Ticket, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, ticket_number, customer_id, status, priority, is_quote, device_type,
               device_brand, device_model, device_color, imei, serial_number, lock_type,
               passcode, pattern_code, account_lock_status, problem_description,
               accessories_received, hardware_specs, condition_checklist, liability_waiver_signed,
               intake_signature_path, repair_type, diagnostics_notes, technician_notes,
               board_diagnostics, estimated_cost, subtotal_parts, subtotal_labor,
               discount_amount, tax_rate_bps, tax_amount, total_price, deposit_paid,
               payment_status, payment_method, warranty_days, warranty_expiry_date,
               created_at, updated_at, ready_at, completed_at
        FROM tickets
        WHERE id = ?1
        "#,
    )?;

    let ticket = stmt.query_row(params![id], map_ticket_row)
        .map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Ticket with id {} not found", id)),
            other => AppError::Database(other),
        })?;

    Ok(ticket)
}

pub fn list_kanban_tickets(conn: &Connection) -> Result<Vec<TicketKanbanCard>, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT t.id, t.ticket_number, c.name, c.primary_phone, t.device_brand,
               t.device_model, t.status, t.priority, t.is_quote, t.repair_type,
               t.total_price, t.deposit_paid, t.created_at
        FROM tickets t
        INNER JOIN customers c ON t.customer_id = c.id
        WHERE t.status != 'cancelled'
        ORDER BY t.id DESC
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        let status_str: String = row.get(6)?;
        let priority_str: String = row.get(7)?;
        let is_quote_int: i64 = row.get(8)?;
        let repair_type_str: String = row.get(9)?;

        Ok(TicketKanbanCard {
            id: row.get(0)?,
            ticket_number: row.get(1)?,
            customer_name: row.get(2)?,
            customer_phone: row.get(3)?,
            device_brand: row.get(4)?,
            device_model: row.get(5)?,
            status: TicketStatus::from_str_opt(&status_str),
            priority: TicketPriority::from_str_opt(&priority_str),
            is_quote: is_quote_int != 0,
            repair_type: RepairType::from_str_opt(&repair_type_str),
            total_price: row.get(10)?,
            deposit_paid: row.get(11)?,
            created_at: row.get(12)?,
        })
    })?;

    let mut cards = Vec::new();
    for row in rows {
        cards.push(row?);
    }
    Ok(cards)
}

pub fn update_ticket_status(conn: &Connection, ticket_id: i64, status: TicketStatus) -> Result<(), AppError> {
    let now = chrono::Utc::now().to_rfc3339();
    
    match status {
        TicketStatus::Ready => {
            conn.execute(
                "UPDATE tickets SET status = ?1, ready_at = ?2 WHERE id = ?3",
                params![status.as_str(), now, ticket_id],
            )?;
        }
        TicketStatus::Completed => {
            conn.execute(
                "UPDATE tickets SET status = ?1, completed_at = ?2 WHERE id = ?3",
                params![status.as_str(), now, ticket_id],
            )?;
        }
        _ => {
            conn.execute(
                "UPDATE tickets SET status = ?1 WHERE id = ?2",
                params![status.as_str(), ticket_id],
            )?;
        }
    }

    Ok(())
}

pub fn add_ticket_item(conn: &Connection, ticket_id: i64, payload: AddItemPayload) -> Result<TicketItem, AppError> {
    // Validate ticket exists
    let _ = get_ticket_by_id(conn, ticket_id)?;

    let total_price = payload.quantity * payload.unit_price;

    conn.execute(
        r#"
        INSERT INTO ticket_items (
            ticket_id, item_type, inventory_item_id, name, quantity, unit_cost, unit_price, total_price
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        "#,
        params![
            ticket_id,
            payload.item_type.as_str(),
            payload.inventory_item_id,
            payload.name,
            payload.quantity,
            payload.unit_cost,
            payload.unit_price,
            total_price
        ],
    )?;

    let item_id = conn.last_insert_rowid();

    // If linked to an inventory item, deduct quantity
    if let Some(inv_id) = payload.inventory_item_id {
        let _ = conn.execute(
            "UPDATE inventory SET quantity = MAX(0, quantity - ?1) WHERE id = ?2",
            params![payload.quantity, inv_id],
        );
    }

    recalculate_ticket_financials(conn, ticket_id)?;

    get_ticket_item_by_id(conn, item_id)
}

pub fn get_ticket_item_by_id(conn: &Connection, id: i64) -> Result<TicketItem, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, ticket_id, item_type, inventory_item_id, name, quantity, unit_cost, unit_price, total_price, created_at
        FROM ticket_items
        WHERE id = ?1
        "#,
    )?;

    let item = stmt.query_row(params![id], |row| {
        let type_str: String = row.get(2)?;
        Ok(TicketItem {
            id: row.get(0)?,
            ticket_id: row.get(1)?,
            item_type: ItemType::from_str_opt(&type_str),
            inventory_item_id: row.get(3)?,
            name: row.get(4)?,
            quantity: row.get(5)?,
            unit_cost: row.get(6)?,
            unit_price: row.get(7)?,
            total_price: row.get(8)?,
            created_at: row.get(9)?,
        })
    }).map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Ticket item {} not found", id)),
        other => AppError::Database(other),
    })?;

    Ok(item)
}

pub fn delete_ticket_item(conn: &Connection, item_id: i64) -> Result<(), AppError> {
    let item = get_ticket_item_by_id(conn, item_id)?;
    conn.execute("DELETE FROM ticket_items WHERE id = ?1", params![item_id])?;

    if let Some(inv_id) = item.inventory_item_id {
        let _ = conn.execute(
            "UPDATE inventory SET quantity = quantity + ?1 WHERE id = ?2",
            params![item.quantity, inv_id],
        );
    }

    recalculate_ticket_financials(conn, item.ticket_id)?;
    Ok(())
}

pub fn list_ticket_items(conn: &Connection, ticket_id: i64) -> Result<Vec<TicketItem>, AppError> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, ticket_id, item_type, inventory_item_id, name, quantity, unit_cost, unit_price, total_price, created_at
        FROM ticket_items
        WHERE ticket_id = ?1
        ORDER BY id ASC
        "#,
    )?;

    let rows = stmt.query_map(params![ticket_id], |row| {
        let type_str: String = row.get(2)?;
        Ok(TicketItem {
            id: row.get(0)?,
            ticket_id: row.get(1)?,
            item_type: ItemType::from_str_opt(&type_str),
            inventory_item_id: row.get(3)?,
            name: row.get(4)?,
            quantity: row.get(5)?,
            unit_cost: row.get(6)?,
            unit_price: row.get(7)?,
            total_price: row.get(8)?,
            created_at: row.get(9)?,
        })
    })?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row?);
    }
    Ok(items)
}

pub fn recalculate_ticket_financials(conn: &Connection, ticket_id: i64) -> Result<(), AppError> {
    let parts_sum: i64 = conn.query_row(
        "SELECT COALESCE(SUM(total_price), 0) FROM ticket_items WHERE ticket_id = ?1 AND item_type = 'part'",
        params![ticket_id],
        |r| r.get(0),
    )?;

    let labor_sum: i64 = conn.query_row(
        "SELECT COALESCE(SUM(total_price), 0) FROM ticket_items WHERE ticket_id = ?1 AND item_type IN ('labor', 'diagnostic', 'fee')",
        params![ticket_id],
        |r| r.get(0),
    )?;

    let (discount, tax_rate_bps): (i64, i64) = conn.query_row(
        "SELECT discount_amount, tax_rate_bps FROM tickets WHERE id = ?1",
        params![ticket_id],
        |r| Ok((r.get(0)?, r.get(1)?)),
    )?;

    let taxable_amount = (parts_sum + labor_sum).saturating_sub(discount);
    let tax_amount = (taxable_amount * tax_rate_bps) / 10000;
    let total_price = taxable_amount + tax_amount;

    conn.execute(
        r#"
        UPDATE tickets SET
            subtotal_parts = ?1,
            subtotal_labor = ?2,
            tax_amount = ?3,
            total_price = ?4
        WHERE id = ?5
        "#,
        params![parts_sum, labor_sum, tax_amount, total_price, ticket_id],
    )?;

    Ok(())
}

pub fn search_tickets(conn: &Connection, query: &str) -> Result<Vec<TicketKanbanCard>, AppError> {
    let pattern = format!("%{}%", query.trim());
    let mut stmt = conn.prepare(
        r#"
        SELECT t.id, t.ticket_number, c.name, c.primary_phone, t.device_brand,
               t.device_model, t.status, t.priority, t.is_quote, t.repair_type,
               t.total_price, t.deposit_paid, t.created_at
        FROM tickets t
        INNER JOIN customers c ON t.customer_id = c.id
        WHERE t.ticket_number LIKE ?1 
           OR c.name LIKE ?1 
           OR c.primary_phone LIKE ?1 
           OR t.imei LIKE ?1 
           OR t.serial_number LIKE ?1
           OR t.device_model LIKE ?1
        ORDER BY t.id DESC
        LIMIT 50
        "#,
    )?;

    let rows = stmt.query_map(params![pattern], |row| {
        let status_str: String = row.get(6)?;
        let priority_str: String = row.get(7)?;
        let is_quote_int: i64 = row.get(8)?;
        let repair_type_str: String = row.get(9)?;

        Ok(TicketKanbanCard {
            id: row.get(0)?,
            ticket_number: row.get(1)?,
            customer_name: row.get(2)?,
            customer_phone: row.get(3)?,
            device_brand: row.get(4)?,
            device_model: row.get(5)?,
            status: TicketStatus::from_str_opt(&status_str),
            priority: TicketPriority::from_str_opt(&priority_str),
            is_quote: is_quote_int != 0,
            repair_type: RepairType::from_str_opt(&repair_type_str),
            total_price: row.get(10)?,
            deposit_paid: row.get(11)?,
            created_at: row.get(12)?,
        })
    })?;

    let mut cards = Vec::new();
    for row in rows {
        cards.push(row?);
    }
    Ok(cards)
}

pub fn get_ticket_detail_view(conn: &Connection, ticket_id: i64) -> Result<TicketDetailView, AppError> {
    let ticket = get_ticket_by_id(conn, ticket_id)?;
    let customer = get_customer_by_id(conn, ticket.customer_id)?;
    let items = list_ticket_items(conn, ticket_id)?;

    // Load photos
    let mut photo_stmt = conn.prepare(
        "SELECT id, ticket_id, stage, file_path, thumbnail_path, notes, created_at FROM ticket_photos WHERE ticket_id = ?1",
    )?;
    let photo_rows = photo_stmt.query_map(params![ticket_id], |row| {
        let stage_str: String = row.get(2)?;
        Ok(TicketPhoto {
            id: row.get(0)?,
            ticket_id: row.get(1)?,
            stage: PhotoStage::from_str_opt(&stage_str),
            file_path: row.get(3)?,
            thumbnail_path: row.get(4)?,
            notes: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;

    let mut photos = Vec::new();
    for p in photo_rows {
        photos.push(p?);
    }

    Ok(TicketDetailView {
        ticket,
        customer,
        items,
        photos,
    })
}

pub fn add_ticket_photo(
    conn: &Connection,
    ticket_id: i64,
    stage: PhotoStage,
    file_path: &str,
    notes: Option<&str>,
) -> Result<TicketPhoto, AppError> {
    let _ = get_ticket_by_id(conn, ticket_id)?;

    conn.execute(
        r#"
        INSERT INTO ticket_photos (ticket_id, stage, file_path, notes)
        VALUES (?1, ?2, ?3, ?4)
        "#,
        params![ticket_id, stage.as_str(), file_path, notes],
    )?;

    let id = conn.last_insert_rowid();
    get_ticket_photo_by_id(conn, id)
}

pub fn get_ticket_photo_by_id(conn: &Connection, id: i64) -> Result<TicketPhoto, AppError> {
    let mut stmt = conn.prepare(
        "SELECT id, ticket_id, stage, file_path, thumbnail_path, notes, created_at FROM ticket_photos WHERE id = ?1",
    )?;

    let photo = stmt.query_row(params![id], |row| {
        let stage_str: String = row.get(2)?;
        Ok(TicketPhoto {
            id: row.get(0)?,
            ticket_id: row.get(1)?,
            stage: PhotoStage::from_str_opt(&stage_str),
            file_path: row.get(3)?,
            thumbnail_path: row.get(4)?,
            notes: row.get(5)?,
            created_at: row.get(6)?,
        })
    }).map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => AppError::NotFound(format!("Ticket photo {} not found", id)),
        other => AppError::Database(other),
    })?;

    Ok(photo)
}

pub fn delete_ticket_photo(conn: &Connection, photo_id: i64) -> Result<(), AppError> {
    let rows = conn.execute("DELETE FROM ticket_photos WHERE id = ?1", params![photo_id])?;
    if rows == 0 {
        return Err(AppError::NotFound(format!("Ticket photo {} not found", photo_id)));
    }
    Ok(())
}

