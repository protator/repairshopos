#!/usr/bin/env bash
set -e

echo "=== Installing Linux Prerequisites for Tauri v2 Desktop ==="
sudo apt update && sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf

echo "=== Prerequisites Installed Successfully! ==="
echo "You can now run: ./run_desktop.sh"
