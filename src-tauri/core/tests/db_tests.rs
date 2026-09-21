use repairshopos_core::db::DbConnection;
use repairshopos_core::db::{customer_repo, ticket_repo};
use repairshopos_core::models::customer::{CommunicationPreference, CreateCustomerPayload, UpdateCustomerPayload};
use repairshopos_core::models::ticket::*;

#[test]
fn test_migrations_and_customer_lifecycle() {
    let db = DbConnection::new_in_memory().expect("Failed to create in-memory DB");

    // 1. Create Customer
    let customer = db.with_conn(|conn| {
        customer_repo::create_customer(
            conn,
            CreateCustomerPayload {
                name: "Karim Benali".to_string(),
                primary_phone: "0550123456".to_string(),
                secondary_phone: Some("0770987654".to_string()),
                email: Some("karim@example.com".to_string()),
                address: Some("Didouche Mourad, Algiers".to_string()),
                tax_id: None,
                communication_preference: Some(CommunicationPreference::Whatsapp),
                notes: Some("Prefers WhatsApp updates in French".to_string()),
            },
        )
    }).expect("Failed to create customer");

    assert_eq!(customer.name, "Karim Benali");
    assert_eq!(customer.communication_preference, CommunicationPreference::Whatsapp);

    // 2. Search Customer
    let search_results = db.with_conn(|conn| {
        customer_repo::search_customers(conn, "0550")
    }).expect("Failed to search customer");
    assert_eq!(search_results.len(), 1);
    assert_eq!(search_results[0].id, customer.id);

    // 3. Update Customer
    let updated = db.with_conn(|conn| {
        customer_repo::update_customer(
            conn,
            customer.id,
            UpdateCustomerPayload {
                name: None,
                primary_phone: None,
                secondary_phone: None,
                email: Some("karim.new@example.com".to_string()),
                address: None,
                tax_id: None,
                communication_preference: None,
                notes: None,
            },
        )
    }).expect("Failed to update customer");
    assert_eq!(updated.email.as_deref(), Some("karim.new@example.com"));
}

#[test]
fn test_ticket_lifecycle_and_calculations() {
    let db = DbConnection::new_in_memory().expect("Failed to create in-memory DB");

    // 1. Setup Customer
    let customer = db.with_conn(|conn| {
        customer_repo::create_customer(
            conn,
            CreateCustomerPayload {
                name: "Amine Ziani".to_string(),
                primary_phone: "0661223344".to_string(),
                secondary_phone: None,
                email: None,
                address: None,
                tax_id: None,
                communication_preference: None,
                notes: None,
            },
        )
    }).expect("Failed to create customer");

    // 2. Create Ticket with condition checklist & board diagnostics
    let ticket = db.with_conn(|conn| {
        ticket_repo::create_ticket(
            conn,
            CreateTicketPayload {
                customer_id: customer.id,
                priority: Some(TicketPriority::High),
                is_quote: Some(false),
                device_type: Some(DeviceType::Smartphone),
                device_brand: "Apple".to_string(),
                device_model: "iPhone 13 Pro".to_string(),
                device_color: Some("Sierra Blue".to_string()),
                imei: Some("354890123456789".to_string()),
                serial_number: Some("F2LW1234ABCD".to_string()),
                lock_type: Some(LockType::Pin),
                passcode: Some("123456".to_string()),
                pattern_code: None,
                account_lock_status: Some(AccountLockStatus::Unlocked),
                problem_description: "No power, device gets hot near charging port".to_string(),
                accessories_received: Some("Case and original box".to_string()),
                condition_checklist: Some(ConditionChecklist {
                    power_on: false,
                    screen_cracked: false,
                    display_defect: false,
                    housing_damaged: true, // minor dent
                    liquid_damage: false,
                    touch_id_face_id: true,
                    front_camera: true,
                    rear_camera: true,
                    charging_port: false,
                    audio_mic_speaker: true,
                    wifi_cellular: true,
                    missing_screws: false,
                    extra_observations: Some("Small dent on lower left bezel".to_string()),
                }),
                liability_waiver_signed: Some(true),
                repair_type: Some(RepairType::BoardLevel),
                diagnostics_notes: Some("PP_VDD_MAIN shorted to ground, hot spot at U2/Tristar area".to_string()),
                board_diagnostics: Some(BoardDiagnostics {
                    prompt_to_boot_amp: Some(1.25),
                    power_rails: vec![PowerRailMeasurement {
                        rail_name: "PP_VDD_MAIN".to_string(),
                        expected_voltage: Some(4.2),
                        measured_voltage: Some(0.0),
                        diode_mode_value: Some(0.01),
                        is_shorted: true,
                    }],
                    smd_components_replaced: vec!["U2 Charging IC".to_string()],
                    donor_board_reference: Some("Donor-IP13P-02".to_string()),
                    ultrasonic_cleaned: false,
                }),
                estimated_cost: Some(15000), // 15,000 DZD
                deposit_paid: Some(5000),    // 5,000 DZD deposit
            },
        )
    }).expect("Failed to create ticket");

    assert!(ticket.ticket_number.starts_with("TK-"));
    assert_eq!(ticket.status, TicketStatus::New);
    assert_eq!(ticket.repair_type, RepairType::BoardLevel);
    assert_eq!(ticket.board_diagnostics.power_rails.len(), 1);
    assert!(ticket.board_diagnostics.power_rails[0].is_shorted);

    // 3. Add Line Items (Parts & Labor)
    let item_part = db.with_conn(|conn| {
        ticket_repo::add_ticket_item(
            conn,
            ticket.id,
            AddItemPayload {
                item_type: ItemType::Part,
                inventory_item_id: None,
                name: "Charging IC Chip".to_string(),
                quantity: 1,
                unit_cost: 1500,
                unit_price: 4000, // 4,000 DZD
            },
        )
    }).expect("Failed to add part item");
    assert_eq!(item_part.total_price, 4000);

    let item_labor = db.with_conn(|conn| {
        ticket_repo::add_ticket_item(
            conn,
            ticket.id,
            AddItemPayload {
                item_type: ItemType::Labor,
                inventory_item_id: None,
                name: "Micro-soldering Board Repair Labor".to_string(),
                quantity: 1,
                unit_cost: 0,
                unit_price: 10000, // 10,000 DZD
            },
        )
    }).expect("Failed to add labor item");
    assert_eq!(item_labor.total_price, 10000);

    // 4. Verify Total Price calculation
    let refreshed_ticket = db.with_conn(|conn| {
        ticket_repo::get_ticket_by_id(conn, ticket.id)
    }).expect("Failed to get refreshed ticket");

    assert_eq!(refreshed_ticket.subtotal_parts, 4000);
    assert_eq!(refreshed_ticket.subtotal_labor, 10000);
    assert_eq!(refreshed_ticket.total_price, 14000);

    // 5. Transition Status
    db.with_conn(|conn| {
        ticket_repo::update_ticket_status(conn, ticket.id, TicketStatus::Diagnosing)
    }).expect("Failed to update status to diagnosing");

    db.with_conn(|conn| {
        ticket_repo::update_ticket_status(conn, ticket.id, TicketStatus::Ready)
    }).expect("Failed to update status to ready");

    let ready_ticket = db.with_conn(|conn| {
        ticket_repo::get_ticket_by_id(conn, ticket.id)
    }).expect("Failed to get ready ticket");
    assert_eq!(ready_ticket.status, TicketStatus::Ready);
    assert!(ready_ticket.ready_at.is_some());

    // 6. Test Kanban Card Listing & Search
    let kanban = db.with_conn(ticket_repo::list_kanban_tickets)
        .expect("Failed to list kanban");
    assert_eq!(kanban.len(), 1);
    assert_eq!(kanban[0].customer_name, "Amine Ziani");
    assert_eq!(kanban[0].total_price, 14000);

    let search_imei = db.with_conn(|conn| {
        ticket_repo::search_tickets(conn, "354890")
    }).expect("Failed to search tickets");
    assert_eq!(search_imei.len(), 1);
    assert_eq!(search_imei[0].id, ticket.id);

    // 7. Full Details View
    let detail_view = db.with_conn(|conn| {
        ticket_repo::get_ticket_detail_view(conn, ticket.id)
    }).expect("Failed to get detail view");
    assert_eq!(detail_view.items.len(), 2);
    assert_eq!(detail_view.customer.name, "Amine Ziani");
}

#[test]
fn test_inventory_and_settings() {
    use repairshopos_core::db::{inventory_repo, settings_repo};
    use repairshopos_core::models::inventory::{CreateInventoryPayload, PartCategory};
    use repairshopos_core::models::settings::ShopSettings;

    let db = DbConnection::new_in_memory().expect("Failed to create in-memory DB");

    // 1. Check default seeded settings
    let default_settings = db.with_conn(settings_repo::get_settings).expect("Failed to get settings");
    assert_eq!(default_settings.shop_name, "RepairShop OS");
    assert_eq!(default_settings.currency, "DZD");
    assert_eq!(default_settings.tax_rate_bps, 1900);

    // 2. Update settings
    let updated_settings = db.with_conn(|conn| {
        settings_repo::update_settings(conn, &ShopSettings {
            shop_name: "Fairak Tech Repair".to_string(),
            shop_phone: "0555001122".to_string(),
            shop_email: "repair@fairak.dz".to_string(),
            shop_address: "Bab Ezzouar, Algiers".to_string(),
            currency: "DZD".to_string(),
            tax_rate_bps: 1900,
            language: "ar".to_string(),
            warranty_days: 60,
            receipt_notes: "Special warranty terms apply.".to_string(),
            logo_path: Some("/path/to/logo.png".to_string()),
        })
    }).expect("Failed to update settings");
    assert_eq!(updated_settings.shop_name, "Fairak Tech Repair");
    assert_eq!(updated_settings.language, "ar");
    assert_eq!(updated_settings.warranty_days, 60);

    // 3. Create Inventory Part
    let part = db.with_conn(|conn| {
        inventory_repo::create_inventory_item(conn, CreateInventoryPayload {
            name: "iPhone 13 OLED Screen Assembly".to_string(),
            sku: Some("SCR-IP13-OLED".to_string()),
            category: Some(PartCategory::Screen),
            quantity: Some(10),
            low_stock_threshold: Some(3),
            cost_price: Some(8500),
            retail_price: 13000,
            compatibility: Some("iPhone 13, iPhone 13 Pro".to_string()),
            notes: Some("Original refurbished grade A+".to_string()),
        })
    }).expect("Failed to create inventory item");
    assert_eq!(part.quantity, 10);
    assert!(!part.is_low_stock);

    // 4. Adjust stock & verify low stock detection
    let adjusted = db.with_conn(|conn| {
        inventory_repo::adjust_stock(conn, part.id, -8)
    }).expect("Failed to adjust stock");
    assert_eq!(adjusted.quantity, 2);
    assert!(adjusted.is_low_stock); // 2 <= threshold of 3

    // 5. Create customer & ticket, link part item and verify auto-deduction
    let customer = db.with_conn(|conn| {
        customer_repo::create_customer(conn, CreateCustomerPayload {
            name: "Test Customer".to_string(),
            primary_phone: "0550000000".to_string(),
            secondary_phone: None,
            email: None,
            address: None,
            tax_id: None,
            communication_preference: None,
            notes: None,
        })
    }).expect("Failed to create customer");

    let ticket = db.with_conn(|conn| {
        ticket_repo::create_ticket(conn, CreateTicketPayload {
            customer_id: customer.id,
            priority: None,
            is_quote: None,
            device_type: None,
            device_brand: "Apple".to_string(),
            device_model: "iPhone 13".to_string(),
            device_color: None,
            imei: None,
            serial_number: None,
            lock_type: None,
            passcode: None,
            pattern_code: None,
            account_lock_status: None,
            problem_description: "Broken screen".to_string(),
            accessories_received: None,
            condition_checklist: None,
            liability_waiver_signed: None,
            repair_type: None,
            diagnostics_notes: None,
            board_diagnostics: None,
            estimated_cost: None,
            deposit_paid: None,
        })
    }).expect("Failed to create ticket");

    let item = db.with_conn(|conn| {
        ticket_repo::add_ticket_item(conn, ticket.id, AddItemPayload {
            item_type: ItemType::Part,
            inventory_item_id: Some(part.id),
            name: "iPhone 13 OLED Screen Replacement".to_string(),
            quantity: 1,
            unit_cost: 8500,
            unit_price: 13000,
        })
    }).expect("Failed to add ticket item");

    // Stock should have decreased from 2 to 1
    let part_after_add = db.with_conn(|conn| {
        inventory_repo::get_inventory_item_by_id(conn, part.id)
    }).expect("Failed to get part");
    assert_eq!(part_after_add.quantity, 1);

    // Delete item, stock should be restored from 1 to 2
    db.with_conn(|conn| {
        ticket_repo::delete_ticket_item(conn, item.id)
    }).expect("Failed to delete ticket item");

    let part_after_delete = db.with_conn(|conn| {
        inventory_repo::get_inventory_item_by_id(conn, part.id)
    }).expect("Failed to get part");
    assert_eq!(part_after_delete.quantity, 2);
}

