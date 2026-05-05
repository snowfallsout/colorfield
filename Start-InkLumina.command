#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed or not available in PATH."
  echo "Please install Node.js LTS first, then run this file again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not available in PATH."
  echo "Please reinstall Node.js LTS, then run this file again."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies for InkLumina..."
  npm install
fi

if [[ ! -d build ]]; then
  echo "Building InkLumina production assets..."
  npm run build
fi

echo "Starting InkLumina on http://127.0.0.1:4173/display"
HOST=127.0.0.1 PORT=4173 ORIGIN=http://127.0.0.1:4173 npm run release:localhost &
server_pid=$!

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4173/display >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

open "http://127.0.0.1:4173/display"
wait "$server_pid"