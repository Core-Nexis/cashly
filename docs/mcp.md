# Cashly MCP server

| | |
|---|---|
| Endpoint | `https://cashly.corenexis.com/api/mcp` |
| Transport | Streamable HTTP (POST only, stateless) |
| Auth | OAuth 2.1 with PKCE, or an API key in `x-api-key` / `Authorization: Bearer` |
| Server version | 1.6.0 |
| Status | `GET https://cashly.corenexis.com/api/mcp/status` (no key needed; returns the version and tool count) |
| Registry | `com.corenexis/cashly` (version 1.4.0) on https://registry.modelcontextprotocol.io |
| Live guide | https://cashly.corenexis.com/developer/mcp |

## Authentication

### OAuth (ChatGPT and other clients that sign in)

| Endpoint | URL |
|---|---|
| Authorize | `https://cashly.corenexis.com/oauth/authorize` |
| Token | `https://cashly.corenexis.com/api/oauth/token` |
| Dynamic client registration (RFC 7591) | `https://cashly.corenexis.com/api/oauth/register` |
| Revoke | `https://cashly.corenexis.com/api/oauth/revoke` |
| Discovery | `https://cashly.corenexis.com/.well-known/oauth-authorization-server` |
| Protected resource metadata | `https://cashly.corenexis.com/.well-known/oauth-protected-resource/api/mcp` |

- Scopes: `read write`. The user can grant read only on the consent screen.
- Access tokens last one hour; a connection stays signed in for 90 days of use.
- A request without credentials gets `401` with a `WWW-Authenticate` header pointing at the resource metadata,
  so compliant clients discover the sign-in flow on their own.

### API key (command-line clients, desktop apps, n8n, scripts)

Create a key in Cashly under **Settings -> Developer -> API keys** and send it as `x-api-key`. A read-only
key gets `403 insufficient_scope` on any write.

## Tools

| Connection | Tools listed |
|---|---|
| OAuth (ChatGPT and other assistant connections) | 75 |
| API key | 79: the same 75 plus 4 earlier names kept for saved workflows (see [Earlier tool names](#earlier-tool-names)) |
| Read-only key or connection | Only the tools that read |

Reads are annotated read-only; edits, deletes, payments and settlements are annotated destructive, so a
client can ask the user before acting. Nothing moves real money: tools that record a payment or a transfer
only update the tracker. Call `tools/list` for the exact JSON schema of every tool.

### Start here

| Tool | What it does |
|---|---|
| `get_overview` | One call to understand the account: profile (name, currency, time zone, country), transactions used and left this month, item limits and the rate limit, every account with id, kind, balance or outstanding, the valid categories and the payment methods. Call it first in a conversation. |

### Account

| Tool | What it does |
|---|---|
| `get_profile` | The Cashly account this connection is signed in to: a stable opaque id, the display name and the email. |
| `health_check` | Check that the connection works. Call first if other tools fail. |
| `get_rate_limit_status` | Requests used and remaining in the current one-minute window. |
| `get_usage` | Monthly transaction credits (used, limit, remaining), caps on active debts, EMIs and subscriptions, and the rate-limit window. |
| `get_user` | Name, email, country, currency, time zone and notification settings. |
| `update_user` | Change the time zone, which decides what "today" means for new entries. |
| `list_signed_in_devices` | Every place the account is signed in (read only). |
| `list_connected_apps` | Apps connected with OAuth, such as ChatGPT (read only). |
| `update_notifications` | Turn individual notification emails on or off. |

### Reference, stats and budget

| Tool | What it does |
|---|---|
| `get_categories` | Valid income and expense category names. |
| `get_payment_methods` | Valid payment methods: cash, bank, upi, credit_card, debit_card, wallet, cheque, other. |
| `get_stats` | Income, expense, savings, balances, top categories, EMI and subscription totals and a trend series for a period. The best first call for "how am I doing" questions. |
| `get_budget` | The monthly budget (total and per-category limits) with this month's spending against it, days left, three-month category averages and this month's fixed commitments. |
| `set_budget` | Create or change the monthly budget; only the fields passed change. |
| `delete_budget` | Delete the whole budget. Transactions are not touched. Confirm first. |
| `compare_months` | Income, expense, savings and spending per category for two months side by side. |

### Transactions

| Tool | What it does |
|---|---|
| `list_transactions` | Transactions, newest first, with income / expense totals for the same filter. Filter by period, type, category, payment method, account and text. |
| `get_transaction` | One transaction by id, with the EMI, subscription, debt or transfer it belongs to. |
| `create_transaction` | Record income (credit) or an expense (debit); the linked account balance or card outstanding updates. |
| `update_transaction` | Change a transaction; balances adjust for the difference. |
| `delete_transaction` | Delete a transaction and reverse its effect. Confirm first. |

### Debts (money lent and borrowed)

| Tool | What it does |
|---|---|
| `list_debts` / `get_debt` | Money lent (debtor) or borrowed (creditor), with paid and remaining amounts and history. |
| `create_debt` / `update_debt` / `delete_debt` | Record, change or remove a debt. |
| `record_debt_payment` | A partial repayment made or received outside Cashly. |
| `settle_debt` / `unsettle_debt` | Mark fully repaid, or reopen. |
| `add_to_debt` | Lent or borrowed more with the same person. |

### Accounts and transfers

| Tool | What it does |
|---|---|
| `list_accounts` | Every bank account, credit card, debit and prepaid card and wallet with balances and ids. |
| `list_banks`, `create_bank`, `update_bank`, `delete_bank` | Bank accounts. |
| `list_credit_cards`, `create_credit_card`, `update_credit_card`, `delete_credit_card` | Credit cards with limit, outstanding, statement and due day. |
| `list_debit_cards`, `create_debit_card`, `update_debit_card`, `delete_debit_card` | Debit cards linked to a bank, and prepaid cards with their own balance. |
| `list_wallets`, `create_wallet`, `update_wallet`, `delete_wallet` | Wallets and cash in hand. |
| `create_transfer` | Money moved between two of the user's own accounts: bank to bank, bank to wallet or prepaid card, cash withdrawal, a credit card bill paid from a bank, or a card to card balance transfer. Saved as two linked transactions that are not income or expense; both balances update. |

### EMIs and loans

| Tool | What it does |
|---|---|
| `list_emis` / `get_emi` / `get_emi_payments` | Loans paid in instalments, schedule and paid instalments. |
| `create_emi` / `update_emi` / `delete_emi` | Instalment, total payable and schedule are worked out from principal, rate and tenure. |
| `record_emi_payment` | Record the next instalment as paid; moves the EMI to the following month. |

### Subscriptions

| Tool | What it does |
|---|---|
| `list_subscriptions` / `get_subscription` / `get_subscription_payments` | Recurring payments with cycle, next payment date and history. |
| `create_subscription` / `update_subscription` / `delete_subscription` | Add, change, pause or cancel a recurring payment. |
| `record_subscription_payment` | Record this cycle as paid; moves the next payment date ahead. |

### Upcoming bills

| Tool | What it does |
|---|---|
| `get_upcoming_bills` | Bills due soon from EMIs, subscriptions, debts and credit cards. |
| `record_bill_payment` | Mark a bill paid and update what it belongs to. |
| `skip_upcoming_bill` | Skip this occurrence without paying. |

### Webhooks

| Tool | What it does |
|---|---|
| `list_webhook_events` | Every event a webhook can subscribe to (`*` = all). |
| `list_webhooks` / `get_webhook` | Registered HTTPS endpoints. |
| `create_webhook` / `update_webhook` / `delete_webhook` | Manage endpoints and their events. |
| `rotate_webhook_secret` | Issue a new signing secret. |
| `send_webhook_test` | Queue a `ping` delivery. |
| `list_webhook_deliveries` | Recent deliveries with status and HTTP code. |

### Earlier tool names

API-key connections also list these earlier names so saved n8n workflows and scripts keep working. Each
behaves exactly like its current name; new integrations should use the current name.

| Earlier name | Current name |
|---|---|
| `pay_debt` | `record_debt_payment` |
| `pay_emi` | `record_emi_payment` |
| `pay_subscription` | `record_subscription_payment` |
| `mark_upcoming_bill_paid` | `record_bill_payment` |

### Removed tools

Three account tools were removed in server version 1.6.0. A saved workflow that still calls one gets a
tool result saying the tool is no longer available, not a protocol error.

## Errors

| Status | Meaning |
|---|---|
| 401 | No or invalid credentials (OAuth clients follow `WWW-Authenticate`). |
| 402 | This account does not include API and MCP access. |
| 403 | Read-only key or token used for a write, or an item limit was reached. |
| 429 | Rate limit or monthly transaction allowance reached; see `Retry-After`. |

Errors inside a tool call come back as a tool result with `isError: true` and one plain sentence that says
what to fix or whether to stop, followed by the API's JSON.
