// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(feature = "gui")]
    repairshopos_lib::run();
    #[cfg(not(feature = "gui"))]
    println!("RepairShopOS compiled in headless mode (enable gui feature for desktop window)");
}
