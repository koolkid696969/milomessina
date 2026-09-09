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

### Checking whether it took

Open the `/exec` URL itself in a browser. It answers with a line of JSON:

    {"ok":true,"hint":"fomo campus form receiver is live","ledger":true,"clock":true}

`ledger` and `clock` are the two halves of this tool. **`true` on both means the
deployed version is the current one.** If either is missing or `false`, the URL is
still serving older code and the page will keep showing its banner, however many
times the script was saved — saving is not deploying.

Two traps account for nearly every case:

- **Deploy → New deployment** mints a *different* `/exec` URL and leaves the old
  one serving the old code. The existing deployment has to be edited instead:
  **Manage deployments →** pencil **→ Version: New version → Deploy**. If you did
  end up with a new URL, either delete that deployment and edit the original, or
  paste the new URL into both `invoice/index.html` and `fomo/assets/form.js`.
- **The code went into a different script project** than the one this URL belongs
  to — easy to do with more than one project in the account. `ledger` stays false
  because the project behind this URL never received it.

## The passcode

`PASSCODE` at the top of `index.html` is `monkey`. Change it to whatever
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

## The clock

The same page carries a clock-in board. Press a name in when they arrive and
out when they leave; the card runs a live timer while someone is on the clock,
and the hours panel below totals the week and all time. Hours export to CSV
separately from the money.

Shifts land in an **`hours`** tab:

| Column | Holds |
| --- | --- |
| `id` | 8 characters, generated server-side |
| `who` | which intern |
| `day` | the local date the shift started, for reading the tab |
| `start`, `end` | UTC stamps — `end` is blank while someone is still on the clock |
| `minutes` | filled in on clock-out |

Start and end are stored in UTC on purpose: the elapsed time is worked out in
whatever timezone the person pressing the button is in, and it has to agree
with what the sheet says. The `day` column sits alongside them so the tab is
still readable by eye.

Someone can only be clocked in once at a time — a second press is refused. A
shift nobody closed shows up in red after 16 hours, saying so rather than
quietly counting as a very long day; close it by clocking out, delete the row
from the table, or fix `end` by hand in the sheet.

## Changing the team

`PEOPLE` at the top of the page's script, and `INVOICE_PEOPLE` in the Apps
Script, are the same four names. Change both — the endpoint refuses a name it
doesn't recognise, on a spend and on a clock-in alike.
