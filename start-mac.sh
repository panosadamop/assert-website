#!/bin/bash
# ASSERT – start website + CMS locally on macOS (double-click in Finder, or run ./start-mac.command).
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  # Homebrew / nvm installs are not always on the PATH of Finder-launched shells.
  [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
  [ -x /opt/homebrew/bin/node ] && export PATH="/opt/homebrew/bin:$PATH"
  [ -x /usr/local/bin/node ] && export PATH="/usr/local/bin:$PATH"
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install the LTS version from https://nodejs.org (or: brew install node) and try again."
  read -r -p "Press Enter to close…"
  exit 1
fi
if [ ! -d backend/node_modules ] || [ ! -d frontend/node_modules ]; then
  node scripts/setup.js || { read -r -p "Setup failed. Press Enter to close…"; exit 1; }
fi
( sleep 12; open "http://localhost:3100"; open "http://localhost:4000/admin" ) &
node scripts/dev.js
