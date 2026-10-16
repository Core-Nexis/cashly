# Cashly webhooks

Cashly sends a signed `POST` to your HTTPS endpoint whenever something changes in the account.

## Events

`<resource>.created`, `<resource>.updated` and `<resource>.deleted` for `transaction`, `debt`,
`bank_account`, `credit_card`, `debit_card`, `wallet`, `emi`, `subscription` and `bill` - 27 events.
Subscribe to `*` for all of them. Test deliveries use the event `ping`.

## Create a webhook

```bash
curl -X POST "https://cashly.corenexis.com/api/v1/webhooks" \
  -H "x-api-key: cn_cashly_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://example.com/cashly-webhook",
        "events": ["transaction.created", "debt.created"],
        "description": "Expense alerts" }'
```

The response returns the signing secret once. Up to 10 webhooks per account.

## Delivery

| Header | Value |
|---|---|
| `Cashly-Event` | The event name, e.g. `transaction.created` |
| `Cashly-Delivery` | Unique delivery id (use it to drop duplicates) |
| `Cashly-Signature` | `t=<unix seconds>,v1=<hex HMAC-SHA256>` |
| `User-Agent` | `Cashly-Webhooks/1.0` |

- Timeout 10 seconds; redirects are not followed. Answer with any 2xx quickly and do the work afterwards.
- Retries: 8 attempts - at once, then after 1 min, 5 min, 15 min, 1 h, 3 h, 6 h and 12 h.
- A webhook is switched off after 20 failed deliveries in a row.

## Verify the signature

The signature is an HMAC-SHA256, keyed with your webhook secret, over `<t>.<raw request body>`.
See [`examples/verify-webhook.js`](../examples/verify-webhook.js). Reject deliveries whose `t` is more than
five minutes old.
