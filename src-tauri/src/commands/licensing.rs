use tauri::State;
use crate::db::DbConnection;
use crate::error::AppError;
use crate::licensing::{self, LicenseInfo};

#[tauri::command]
pub async fn get_license_info(
    state: State<'_, DbConnection>,
) -> Result<LicenseInfo, AppError> {
    state.with_conn(licensing::get_license_info)
}

#[tauri::command]
pub async fn activate_license(
    state: State<'_, DbConnection>,
    key: String,
) -> Result<LicenseInfo, AppError> {
    state.with_conn(|conn| licensing::activate_license(conn, &key))
}

#[tauri::command]
pub async fn get_machine_hwid() -> Result<String, AppError> {
    Ok(licensing::get_hardware_id())
}
