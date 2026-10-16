# Cashly REST API

| | |
|---|---|
| Base URL | `https://cashly.corenexis.com/api/v1` |
| Auth | `x-api-key: <key>` or `Authorization: Bearer <key or OAuth access token>` |
| Format | JSON in, JSON out |
| Live docs | https://cashly.corenexis.com/developer/api |

Send a real `User-Agent` header: requests with none, or with a default library agent such as
`python-requests`, are blocked at the edge.

```bash
curl https://cashly.corenexis.com/api/v1/health \
  -H "x-api-key: cn_cashly_your_key_here" \
  -H "User-Agent: my-app/1.0"
```

## Endpoints

### Account

| Method | Path | |
|---|---|---|
| GET | `/me` | Profile |
| PATCH | `/me` | Change the time zone |
| GET | `/me/subscription` | Plan and status |
| GET | `/me/payments` | Payments for the plan |
| GET | `/usage` | Monthly credits and rate-limit window |
| GET | `/me/sessions` | Signed-in devices |
| GET | `/me/connected-apps` | OAuth apps |
| PATCH | `/me/notifications` | Notification emails on or off |

### Reference and stats

| Method | Path | |
|---|---|---|
| GET | `/categories` | Category names |
| GET | `/payment-methods` | Payment method values |
| GET | `/stats?range=month\|7d\|30d\|3m\|all` | Totals, balances, top categories, trend |
| GET | `/rate-limit` | Current window |
| GET | `/health` | Key and plan check |

### Data

| Resource | Endpoints |
|---|---|
| Transactions | `GET /transactions`, `GET /transactions/:id`, `POST /transactions`, `PATCH /transactions/:id`, `DELETE /transactions/:id` |
| Debts | `GET /debts`, `GET /debts/:id`, `POST /debts`, `PATCH /debts/:id`, `DELETE /debts/:id`, `POST /debts/:id/add`, `POST /debts/:id/payment`, `POST /debts/:id/settle`, `POST /debts/:id/unsettle` |
| Accounts | `GET /accounts`; `/banks`, `/credit-cards`, `/debit-cards`, `/wallets` each with `GET`, `POST`, `PATCH /:id`, `DELETE /:id` |
| EMIs | `GET /emis`, `GET /emis/:id`, `GET /emis/:id/payments`, `POST /emis`, `PATCH /emis/:id`, `DELETE /emis/:id`, `POST /emis/:id/pay` |
| Subscriptions | `GET /subscriptions`, `GET /subscriptions/:id`, `GET /subscriptions/:id/payments`, `POST /subscriptions`, `PATCH /subscriptions/:id`, `DELETE /subscriptions/:id`, `POST /subscriptions/:id/pay` |
| Upcoming bills | `GET /upcoming-bills`, `POST /upcoming-bills/:id/pay`, `POST /upcoming-bills/:id/skip` |
| Webhooks | see [webhooks.md](webhooks.md) |

## Example: log an expense

```bash
curl -X POST https://cashly.corenexis.com/api/v1/transactions \
  -H "x-api-key: cn_cashly_your_key_here" \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-app/1.0" \
  -d '{ "type": "debit", "amount": 500, "category": "Groceries", "payment_method": "upi" }'
```

## Limits

- Requests per key per minute: 60 on Pro, 120 on Pro Plus. Every response carries
  `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`; going over returns `429` with `Retry-After`.
- New transactions per billing period follow the plan; going over returns `429 transaction_limit_exceeded`.

## Errors

| Status | Meaning |
|---|---|
| 400 | Invalid input; the body says which field. |
| 401 | Missing or invalid key or token. |
| 402 | `upgrade_required`: the plan does not include API access. |
| 403 | Read-only key used for a write (`insufficient_scope`), or a blocked client. |
| 404 | Not found, or not the key owner's record. |
| 429 | Rate limit or transaction limit reached. |
