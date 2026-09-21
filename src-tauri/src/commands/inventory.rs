use tauri::State;
use repairshopos_core::db::{inventory_repo, DbConnection};
use repairshopos_core::error::AppError;
use repairshopos_core::models::inventory::{
    CreateInventoryPayload, InventoryItem, UpdateInventoryPayload,
};

#[tauri::command]
pub async fn create_inventory_item(
    state: State<'_, DbConnection>,
    payload: CreateInventoryPayload,
) -> Result<InventoryItem, AppError> {
    state.with_conn(|conn| inventory_repo::create_inventory_item(conn, payload))
}

#[tauri::command]
pub async fn get_inventory_item_by_id(
    state: State<'_, DbConnection>,
    id: i64,
) -> Result<InventoryItem, AppError> {
    state.with_conn(|conn| inventory_repo::get_inventory_item_by_id(conn, id))
}

#[tauri::command]
pub async fn update_inventory_item(
    state: State<'_, DbConnection>,
    id: i64,
    payload: UpdateInventoryPayload,
) -> Result<InventoryItem, AppError> {
    state.with_conn(|conn| inventory_repo::update_inventory_item(conn, id, payload))
}

#[tauri::command]
pub async fn delete_inventory_item(
    state: State<'_, DbConnection>,
    id: i64,
) -> Result<(), AppError> {
    state.with_conn(|conn| inventory_repo::delete_inventory_item(conn, id))
}

#[tauri::command]
pub async fn list_inventory_items(
    state: State<'_, DbConnection>,
    search: Option<String>,
    category: Option<String>,
    low_stock_only: Option<bool>,
) -> Result<Vec<InventoryItem>, AppError> {
    state.with_conn(|conn| {
        inventory_repo::list_inventory_items(
            conn,
            search.as_deref(),
            category.as_deref(),
            low_stock_only.unwrap_or(false),
        )
    })
}

#[tauri::command]
pub async fn adjust_inventory_stock(
    state: State<'_, DbConnection>,
    id: i64,
    delta: i64,
) -> Result<InventoryItem, AppError> {
    state.with_conn(|conn| inventory_repo::adjust_stock(conn, id, delta))
}
