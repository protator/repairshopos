# RepairShopOS 🛠️

> **Lightweight, offline-first desktop application engineered specifically for independent phone, laptop, and electronic repair shops.**

RepairShopOS provides an all-in-one offline ecosystem to streamline bench diagnostics, customer tracking, spare parts inventory, and financial invoicing. By eliminating reliance on cloud subscriptions or constant internet connectivity, it guarantees complete data sovereignty and operational continuity.

---

## 🌟 Key Features

### 📋 1. Visual Intake & Liability Protection
- **5-Step Intake Flow**: Seamless intake capturing customer info, hardware details, security credentials, and initial repair quotes.
- **14-Point Pre-Repair Checklist**: Logs cosmetic damage (cracked glass, bent chassis) and functional states (touch responsiveness, cameras, liquid indicators, audio, biometrics) to eliminate customer liability disputes.
- **Lock & Security Logging**: Records screen PINs, pattern codes, and iCloud / Google FRP lock status safely for bench testing.

### 📊 2. Kanban Repair Pipeline
- Visual 5-stage Kanban board:
  - **New Intake** ➔ **Diagnosing** ➔ **Awaiting Parts** ➔ **Ready for Pickup** ➔ **Completed**
- Single-click stage advancement and status reversal.
- Real-time bench KPI metrics: active repairs, awaiting parts, ready for pickup, and pipeline financial volume.

### 🔬 3. Workshop Workbench & Board Telemetry
- Detailed hardware overview with customer specs and pre-repair damage badges.
- **Board-Level & Micro-Soldering Log**:
  - DC power supply prompt-to-boot current draw (Amperes).
  - Ultrasonic bath cleaning verification.
  - Log replaced SMD ICs and chips (e.g. Tristar, Hydra, PMIC, backlight diodes).
  - Donor board reference tracking.
- Private internal technician workbench notes.

### 📦 4. Spare Parts Inventory & Automated Stock Tracking
- Categorized catalog: Screens, Batteries, Charging Ports, SMD Chips, Cameras, Housings, Consumables.
- **Automated Deduction**: Adding an inventory part to a ticket line item instantly decrements local stock; removing it automatically restores stock.
- Low stock alert badges and direct (+ / -) bench stock adjustments.

### 🧾 5. Invoicing & POS
- Itemized billing combining parts and labor charges.
- Local currency formatting with **DZD (Algerian Dinar - د.ج)** default support.
- Configurable tax rates (e.g. 19% VAT) and advance deposit balance calculations.
- Printable thermal and A4 repair receipts with ticket verification QR/barcode, shop branding, and warranty terms.

### 🌍 6. Trilingual UI with Dynamic RTL Support
- Dynamic language switcher supporting **English**, **Français**, and **العربية**.
- Native **Right-to-Left (RTL)** layout adaptation when Arabic is selected.

---

## 🏗️ Architecture & Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | [Tauri v2](https://v2.tauri.app/) | Security, minimal binary footprint (~15MB), low memory usage |
| **Backend & DB** | Rust + SQLite (`rusqlite`) | Bundled SQLite, local file persistence, zero IT setup |
| **Decoupled Core** | `repairshopos-core` | Pure domain logic crate; runs unit tests without GUI dependencies |
| **Frontend UI** | React 19 + TypeScript + Vite | Rapid, type-safe frontend rendering |
| **Styling** | Tailwind CSS | Utility-first dark bench technician UI with print stylesheets |
| **Icons** | Lucide React | Crisp, lightweight SVG iconography |

### Directory Structure
```
prd/
├── src-tauri/
│   ├── core/                  # Decoupled domain models, SQLite migrations, & repositories
│   │   ├── src/
│   │   │   ├── db/            # Migrations, customer, ticket, inventory, & settings repos
│   │   │   └── models/        # Rust structs & enums (Customer, Ticket, Inventory, Settings)
│   │   └── tests/             # SQLite integration test suites
│   ├── src/
│   │   ├── commands/          # Tauri IPC command handlers
│   │   ├── lib.rs             # Tauri runtime initialization & command registration
│   │   └── main.rs
│   ├── tauri.conf.json        # Tauri v2 desktop window & capability configuration
│   └── Cargo.toml
├── src/                       # React 19 + TypeScript frontend
│   ├── components/            # Kanban, IntakeModal, Workbench, Invoices, CRM, Inventory, Settings
│   ├── i18n/                  # Trilingual translation dictionaries & RTL context
│   ├── services/              # Dual-mode API (Tauri IPC invoke + browser mock fallback)
│   ├── types/                 # TypeScript domain types
│   ├── App.tsx
│   └── index.css              # Tailwind CSS directives & dark theme rules
├── install_linux_deps.sh      # One-step Linux GTK/WebKit prerequisite installer
├── run_desktop.sh             # Native desktop app launch script
└── package.json
```

---

## 🚀 Getting Started

### 1. Browser Development Mode (Instant Preview)
Test and preview the full UI and mock database immediately in any web browser:

```bash
npm install
npm run dev
```
Open **http://localhost:1420/** in your browser.

---

### 2. Native Desktop Application (Tauri v2)

#### Linux Prerequisites:
Install GTK3 and WebKit development libraries:
```bash
./install_linux_deps.sh
# Or manually: sudo apt update && sudo apt install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

#### Launch Desktop App:
```bash
./run_desktop.sh
# Or: npm run tauri dev
```

---

## 🧪 Testing & Verification

* **Backend SQLite & Logic Tests**:
  ```bash
  cd src-tauri/core && cargo test
  # Runs customer lifecycle, ticket state machine, and inventory stock auto-deduction tests
  ```

* **Frontend Build & TypeScript Verification**:
  ```bash
  npm run build
  # Checks TypeScript types and compiles Vite production bundle
  ```

---

## 📄 License
Offline-first commercial desktop application. All rights reserved.
