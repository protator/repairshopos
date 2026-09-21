pub mod migrations;
pub mod customer_repo;
pub mod ticket_repo;
pub mod inventory_repo;
pub mod settings_repo;

use std::path::Path;
use std::sync::{Arc, Mutex};
use rusqlite::Connection;
use crate::error::AppError;

#[derive(Clone)]
pub struct DbConnection(pub Arc<Mutex<Connection>>);

impl DbConnection {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, AppError> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;")?;
        migrations::run_migrations(&conn)?;
        Ok(Self(Arc::new(Mutex::new(conn))))
    }

    pub fn new_in_memory() -> Result<Self, AppError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;
        migrations::run_migrations(&conn)?;
        Ok(Self(Arc::new(Mutex::new(conn))))
    }

    pub fn with_conn<F, R>(&self, f: F) -> Result<R, AppError>
    where
        F: FnOnce(&Connection) -> Result<R, AppError>,
    {
        let conn = self.0.lock().map_err(|_| AppError::Internal("Database lock poisoned".to_string()))?;
        f(&conn)
    }
}
