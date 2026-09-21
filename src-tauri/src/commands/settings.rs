use tauri::State;
use repairshopos_core::db::{settings_repo, DbConnection};
use repairshopos_core::error::AppError;
use repairshopos_core::models::settings::ShopSettings;

#[tauri::command]
pub async fn get_shop_settings(
    state: State<'_, DbConnection>,
) -> Result<ShopSettings, AppError> {
    state.with_conn(settings_repo::get_settings)
}

#[tauri::command]
pub async fn update_shop_settings(
    state: State<'_, DbConnection>,
    settings: ShopSettings,
) -> Result<ShopSettings, AppError> {
    state.with_conn(|conn| settings_repo::update_settings(conn, &settings))
}
