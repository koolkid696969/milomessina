# The stipend ledger

`/invoice` is the internal expense and hours tool for arya's fomo bootcamp.
Milo, Bijan, Jesse and Luchi log what they front — lunches, API credits, coffee
— and clock in and out; the page totals what's been spent, who is still owed,
where the money went, and how many hours each of them has worked.

It works the moment it loads. Nothing to deploy, nothing to configure.

## Where it saves

`BACKEND` at the top of the page's script decides, and it ships as `'device'`.

**`'device'`** keeps everything in that browser's own storage. It is instant and
private, and the catch is in the name: **the ledger lives on whichever computer
it was typed on.** Arya's laptop and Milo's laptop hold different ledgers, and
clearing site data clears it. Treat the CSV exports as the way anything leaves
one machine.

**`'sheet'`** is the shared version: one ledger in a Google Sheet that everyone
reads and writes, surviving any one browser. It costs one deploy — see below.
Switch by changing the constant:

```js
var BACKEND = 'sheet';
```

Nothing else changes. Both backends answer the same calls, so every button on
the page behaves identically either way.

## Starting out

The ledger starts empty and only ever holds what someone actually logs. Nothing
is seeded, so the totals and charts stay at zero until the first spend goes in
and the first shift is clocked.

Every control writes straight through: adding a spend, marking one paid, settling
a whole person, clocking in and out, and both deletes — which ask once before they
go, so a mis-click costs nothing. **Refresh** re-reads the store, which matters
when the page is open in more than one tab on the same browser.

## The passcode

`PASSCODE` at the top of `index.html` is `monkey`. Change it to whatever the
four of them should type; it is remembered per browser afterwards.

It travels in the page source, so it is a turnstile that keeps the ledger off
the open web — **not** a password. Anyone who reads the source can find it. Set
it to `''` to drop the gate entirely.

## Switching on the shared sheet

The ledger endpoint lives in `fomo/setup/apps-script.gs`, alongside the receiver
the fomo forms already use. It writes an `invoice` tab and an `hours` tab in the
same sheet, through the same deployment, so there is no second URL.

1. Open the sheet → **Extensions → Apps Script**.
2. Replace `Code.gs` with the current `fomo/setup/apps-script.gs`.
3. **Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy**.
4. Set `BACKEND` to `'sheet'` in `invoice/index.html`.

Step 3 is the one that matters. Apps Script serves the last *deployed* version,
not the last saved one, so pasting the code and hitting save changes nothing.

**Use Manage deployments, not New deployment.** "New deployment" mints a
*different* `/exec` URL and leaves the original — the one this site points at —
serving the old code, which looks exactly like nothing happened.

### Checking whether it took

Open the `/exec` URL itself in a browser:

    {"ok":true,"hint":"fomo campus form receiver is live","ledger":true,"clock":true}

`ledger` and `clock` are the two halves of this tool. **`true` on both means the
deployed version is the current one.** If either is missing or `false`, that URL
is still serving older code. Either you ended up with a second deployment, or
the paste went into a different script project than the one this URL belongs to.

If you do end up with a new URL, paste it into `ENDPOINT` in both
`invoice/index.html` and `fomo/assets/form.js`, and make sure its **Who has
access** is set to **Anyone** — a fresh deployment defaults to *Only myself*,
which locks out the ledger and all three fomo forms alike.

## What the sheet holds

The `invoice` tab:

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

The `hours` tab:

| Column | Holds |
| --- | --- |
| `id` | 8 characters, generated server-side |
| `who` | which intern |
| `day` | the local date the shift started, for reading the tab |
| `start`, `end` | UTC stamps — `end` is blank while someone is still on the clock |
| `minutes` | filled in on clock-out |

Start and end are stored in UTC on purpose: the elapsed time is worked out in
whatever timezone the person pressing the button is in, and it has to agree with
what the sheet says. The `day` column sits alongside so the tab still reads well.

Edit either tab by hand if you like — the page re-reads them every 30 seconds.
Just leave the `id` columns alone; the page uses them to find rows.

## The clock

Press a name in when they arrive and out when they leave. The card runs a live
timer while someone is on the clock, and the hours panel below totals the week
and all time. Hours export to CSV separately from the money.

Someone can only be clocked in once at a time — a second press is refused. A
shift nobody closed shows up in red after 16 hours, saying so rather than
quietly counting as a very long day; close it by clocking out, or delete the
row from the table.

## Changing the team

`PEOPLE` at the top of the page's script, and `INVOICE_PEOPLE` in the Apps
Script, are the same four names. Change both — the endpoint refuses a name it
doesn't recognise, on a spend and on a clock-in alike.
