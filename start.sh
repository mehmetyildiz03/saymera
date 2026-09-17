#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
PORT="${PORT:-4173}"
URL="http://localhost:${PORT}/"
if command -v python3 >/dev/null 2>&1; then
  echo "SAYMERA: $URL"
  python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  echo "SAYMERA: $URL"
  python -m http.server "$PORT"
else
  echo "Python bulunamadi. Bu klasorde bir yerel HTTP sunucusu baslatin." >&2
  exit 1
fi
