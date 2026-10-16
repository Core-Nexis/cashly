#!/usr/bin/env sh
# Logs one expense through the Cashly REST API.
# Usage: CASHLY_API_KEY=cn_cashly_... ./log-expense.sh 450 Groceries upi
set -eu
AMOUNT="${1:?amount}"
CATEGORY="${2:-Groceries}"
METHOD="${3:-cash}"
curl -sS -X POST https://cashly.corenexis.com/api/v1/transactions \
  -H "x-api-key: ${CASHLY_API_KEY:?set CASHLY_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "User-Agent: cashly-example/1.0" \
  -d "{\"type\":\"debit\",\"amount\":${AMOUNT},\"category\":\"${CATEGORY}\",\"payment_method\":\"${METHOD}\"}"
