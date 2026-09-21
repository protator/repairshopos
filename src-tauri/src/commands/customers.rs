use tauri::State;
use crate::db::DbConnection;
use crate::error::AppError;
use crate::models::customer::{CreateCustomerPayload, Customer, UpdateCustomerPayload};
use crate::db::customer_repo;

#[tauri::command]
pub async fn create_customer(
    state: State<'_, DbConnection>,
    payload: CreateCustomerPayload,
) -> Result<Customer, AppError> {
    state.with_conn(|conn| customer_repo::create_customer(conn, payload))
}

#[tauri::command]
pub async fn get_customer_by_id(
    state: State<'_, DbConnection>,
    customer_id: i64,
) -> Result<Customer, AppError> {
    state.with_conn(|conn| customer_repo::get_customer_by_id(conn, customer_id))
}

#[tauri::command]
pub async fn update_customer(
    state: State<'_, DbConnection>,
    customer_id: i64,
    payload: UpdateCustomerPayload,
) -> Result<Customer, AppError> {
    state.with_conn(|conn| customer_repo::update_customer(conn, customer_id, payload))
}

#[tauri::command]
pub async fn search_customers(
    state: State<'_, DbConnection>,
    query: String,
) -> Result<Vec<Customer>, AppError> {
    state.with_conn(|conn| customer_repo::search_customers(conn, &query))
}

#[tauri::command]
pub async fn list_customers(
    state: State<'_, DbConnection>,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<Customer>, AppError> {
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);
    state.with_conn(|conn| customer_repo::list_customers(conn, limit, offset))
}
