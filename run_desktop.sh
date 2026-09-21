#!/usr/bin/env bash
set -e

# Load Rust cargo environment
if [ -f "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
fi

cd "$(dirname "$0")"

echo "=== Launching RepairShopOS Native Desktop App ==="
npm run tauri dev
