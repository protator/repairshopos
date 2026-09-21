use tauri::State;
use crate::db::DbConnection;
use crate::error::AppError;
use crate::models::ticket::*;
use crate::db::ticket_repo;

#[tauri::command]
pub async fn create_ticket(
    state: State<'_, DbConnection>,
    payload: CreateTicketPayload,
) -> Result<TicketDetailView, AppError> {
    let ticket = state.with_conn(|conn| ticket_repo::create_ticket(conn, payload))?;
    state.with_conn(|conn| ticket_repo::get_ticket_detail_view(conn, ticket.id))
}

#[tauri::command]
pub async fn get_ticket_by_id(
    state: State<'_, DbConnection>,
    ticket_id: i64,
) -> Result<Ticket, AppError> {
    state.with_conn(|conn| ticket_repo::get_ticket_by_id(conn, ticket_id))
}

#[tauri::command]
pub async fn get_ticket_details(
    state: State<'_, DbConnection>,
    ticket_id: i64,
) -> Result<TicketDetailView, AppError> {
    state.with_conn(|conn| ticket_repo::get_ticket_detail_view(conn, ticket_id))
}

#[tauri::command]
pub async fn list_kanban_tickets(
    state: State<'_, DbConnection>,
) -> Result<Vec<TicketKanbanCard>, AppError> {
    state.with_conn(ticket_repo::list_kanban_tickets)
}

#[tauri::command]
pub async fn update_ticket_status(
    state: State<'_, DbConnection>,
    ticket_id: i64,
    status: TicketStatus,
) -> Result<(), AppError> {
    state.with_conn(|conn| ticket_repo::update_ticket_status(conn, ticket_id, status))
}

#[tauri::command]
pub async fn add_ticket_item(
    state: State<'_, DbConnection>,
    ticket_id: i64,
    item: AddItemPayload,
) -> Result<TicketItem, AppError> {
    state.with_conn(|conn| ticket_repo::add_ticket_item(conn, ticket_id, item))
}

#[tauri::command]
pub async fn delete_ticket_item(
    state: State<'_, DbConnection>,
    item_id: i64,
) -> Result<(), AppError> {
    state.with_conn(|conn| ticket_repo::delete_ticket_item(conn, item_id))
}

#[tauri::command]
pub async fn search_tickets(
    state: State<'_, DbConnection>,
    query: String,
) -> Result<Vec<TicketKanbanCard>, AppError> {
    state.with_conn(|conn| ticket_repo::search_tickets(conn, &query))
}
