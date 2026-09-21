pub use repairshopos_core::{db, error, models, licensing};
pub mod commands;

use db::DbConnection;
use tauri::Manager;

#[cfg(feature = "gui")]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;

            std::fs::create_dir_all(&app_data_dir)?;
            let db_path = app_data_dir.join("repairshopos.db");

            let db = DbConnection::new(&db_path)
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;

            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_customer,
            commands::get_customer_by_id,
            commands::update_customer,
            commands::search_customers,
            commands::list_customers,
            commands::create_ticket,
            commands::get_ticket_by_id,
            commands::get_ticket_details,
            commands::list_kanban_tickets,
            commands::update_ticket_status,
            commands::add_ticket_item,
            commands::delete_ticket_item,
            commands::search_tickets,
            commands::create_inventory_item,
            commands::get_inventory_item_by_id,
            commands::update_inventory_item,
            commands::delete_inventory_item,
            commands::list_inventory_items,
            commands::adjust_inventory_stock,
            commands::get_shop_settings,
            commands::update_shop_settings,
            commands::add_ticket_photo,
            commands::delete_ticket_photo,
            commands::get_license_info,
            commands::activate_license,
            commands::get_machine_hwid,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
