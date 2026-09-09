# The stipend ledger

`/invoice` is the internal expense tool for arya's fomo bootcamp. Milo, Bijan,
Jesse and Luchi log what they front — lunches, API credits, coffee — and Arya
sees the running total, who is still owed, and where the money went.

It writes to the **`invoice` tab** of the same Google Sheet the fomo forms use,
through the same Apps Script deployment. No new sheet, no new URL, no database.

---

## One step before it works

The page talks to the Apps Script in `fomo/setup/apps-script.gs`, which now
carries the ledger endpoint. Apps Script serves the last *deployed* version,
not the saved one, so the code has to be pushed and redeployed once:

1. Open the sheet → **Extensions → Apps Script**.
2. Replace `Code.gs` with the current `fomo/setup/apps-script.gs`.
3. **Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy**.

The `/exec` URL does not change, so the apply, submit and report forms carry on
untouched. The `invoice` tab builds itself, with its own headers, on the first
spend logged.

Until that redeploy happens the page says so plainly on a banner and refuses to
pretend it saved anything.

## The passcode

`PASSCODE` at the top of `index.html` is `fomo-stipend`. Change it to whatever
you want the four of them to type; it is remembered per browser afterwards.

It travels in the page source, so it is a turnstile that keeps the ledger off
the open web — **not** a password. Anyone who reads the source can find it. The
real lock is the Google Sheet, which stays private to your account. Set
`PASSCODE` to `''` to drop the gate entirely.

If you also set `INVOICE_KEY` in the Apps Script CONFIG to the same string, the
endpoint itself turns away requests that don't carry it — worth doing, since the
`/exec` URL is public. It is independent of `SHARED_SECRET`, so the forms are
unaffected either way.

## What the tab holds

| Column | Holds |
| --- | --- |
| `id` | 8 characters, generated server-side; how a row is found again |
| `logged` | when it was added |
| `date` | the day of the spend, `YYYY-MM-DD` |
| `who` | Milo, Bijan, Jesse or Luchi — anything else is refused |
| `what` | the description |
| `category` | lunch, coffee, ai, software, travel, supplies, other |
| `amount` | USD |
| `status` | `pending` or `reimbursed` |
| `note`, `receipt` | optional |
| `reimbursed` | when it was marked paid |

Edit the tab by hand if you like — the page re-reads it every 30 seconds. Just
leave the `id` column alone; the page uses it to find rows.

## Changing the team

`PEOPLE` at the top of the page's script, and `INVOICE_PEOPLE` in the Apps
Script, are the same four names. Change both — the endpoint refuses a name it
doesn't recognise.
