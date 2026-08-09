#!/usr/bin/env bash
# Sends one WhatsApp message through the running service.
#
#   ./scripts/send-test.sh +15145551234 "bonjour depuis DSS"
#
# In sandbox mode the recipient must already be allowlisted from
# Dashboard > Messages API Sandbox, otherwise Vonage rejects the send.
set -euo pipefail

TO="${1:-}"
TEXT="${2:-Test message from DSS Multiservices.}"
HOST="${HOST:-http://localhost:8080}"

if [ -z "$TO" ]; then
  echo "usage: $0 <recipient-e164> [text]" >&2
  exit 64
fi

cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  echo "error: .env not found - copy .env.example and fill it in" >&2
  exit 66
fi

# Read the token without echoing it or exporting the rest of .env.
ADMIN_TOKEN=$(grep -E '^ADMIN_TOKEN=' .env | cut -d= -f2-)
if [ -z "$ADMIN_TOKEN" ]; then
  echo "error: ADMIN_TOKEN is empty in .env - generate one with: openssl rand -hex 32" >&2
  exit 78
fi

echo "sending to $TO via $HOST ..."
HTTP_CODE=$(curl -sS -o /tmp/dss-send-result.json -w '%{http_code}' \
  -X POST "$HOST/admin/whatsapp/send" \
  -H 'Content-Type: application/json' \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d "$(TO="$TO" TEXT="$TEXT" node -e 'console.log(JSON.stringify({to:process.env.TO,text:process.env.TEXT}))')")

echo "HTTP $HTTP_CODE"
cat /tmp/dss-send-result.json; echo
rm -f /tmp/dss-send-result.json

case "$HTTP_CODE" in
  200) echo "OK - watch the service log for the delivery receipt on /webhooks/vonage/status" ;;
  403) echo "Rejected: ADMIN_TOKEN mismatch between .env and the running process." >&2; exit 1 ;;
  502) echo "Vonage rejected the send. Common causes: recipient not allowlisted in" >&2
       echo "the sandbox, or VONAGE_WHATSAPP_NUMBER is not the sandbox number." >&2; exit 1 ;;
  *)   echo "Unexpected response." >&2; exit 1 ;;
esac
