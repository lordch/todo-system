#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"

PYTHON_BIN="${PYTHON_BIN:-python3}"

PORT="$("$PYTHON_BIN" - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
port = s.getsockname()[1]
s.close()
print(port)
PY
)"

URL="http://127.0.0.1:${PORT}/"

echo "Starting /odhacz server…"
echo "Root: $ROOT"
echo "URL:  $URL"
echo
echo "Press Ctrl+C to stop."
echo

open "$URL" >/dev/null 2>&1 || true

cd "$ROOT"
exec "$PYTHON_BIN" "$HERE/server.py" --host 127.0.0.1 --port "$PORT"


