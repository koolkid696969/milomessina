# arya's fomo bootcamp — the internal tool

`/invoice` is the internal tool for arya's fomo bootcamp.
Milo, Bijan, Jesse and Luchi log what they front — lunches, API credits, coffee
— and clock in and out; the page totals what's been spent, who is still owed,
where the money went, and how many hours each of them has worked.

It works the moment it loads. Nothing to deploy, nothing to configure.

## Where it saves

`BACKEND` at the top of the page's script decides, and it ships as `'auto'`.

**`'device'`** keeps everything in that browser's own storage. It is instant and
private, and the catch is in the name: **the ledger lives on whichever computer
it was typed on.** Arya's laptop and Milo's laptop hold different ledgers, and
clearing site data clears it. This is also why **nobody sees anybody else's
clock** on device storage: a shift clocked on one laptop is a row in that
browser and has never left it. Treat the CSV exports as the way anything leaves
one machine.

**`'sheet'`** is the shared version: one ledger in a Google Sheet that everyone
reads and writes, surviving any one browser. It is what makes the clock cards
mean *who is working right now* rather than *who is working on this laptop*. It
costs one deploy — see below.

**`'auto'`**, the default, is both in the only order that is safe. The page
opens on this browser's own store — never blank, never waiting, an open shift
still ticking — and then asks the endpoint whether the version actually deployed
behind it carries the ledger. If it does, the page moves itself over and the
clocks go live for everyone. If it does not, it stays on device storage and says
so in a banner naming the fix, rather than breaking on a URL that cannot answer
it.

That last part is the point. Apps Script serves the last *deployed* version, so
`'sheet'` set before the redeploy is a page that loads to an error; `'sheet'`
set after means someone has to edit and ship this file at exactly the right
moment. `'auto'` removes the ordering: deploy the page whenever, deploy the
script whenever, and the clocks come on by themselves on the next load.

Nothing else changes. All three answer the same calls, so every button on the
page behaves identically either way.

### The first load after the switch

Whatever was typed while the page was on device storage is still in that
browser — but the sheet has never seen it, so the switch is what takes it off
the screen. The page notices, counts it, and offers one button:

> **The clocks are shared from now on.** 3 shifts and 2 spends logged on this
> browser are not on the shared sheet yet, including 2 shifts still running.
> Still saved here either way — send them up and everyone sees them.

Nothing goes up until that is pressed, and nothing local is deleted either way.
A shift that is still running arrives still running, **carrying the time it
actually started** — this is why the Apps Script needs a `shiftimport` action
rather than reusing `clockin`, which stamps the server's own clock and would
turn an hour already worked into an hour of nothing. Anything already on the
sheet is skipped rather than written twice, so pressing it again after a
half-finished send costs nothing. Receipt photos stay behind, since the sheet
holds a 500-character cell and not an image; the page says how many.

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

`INVOICE_KEY` in the Apps Script is set to the same string, so the **endpoint**
turns away requests that don't carry it, not just the page. That matters more
than it looks: the `/exec` URL is open to anyone who has it, and without the key
a stranger could read the ledger and clock people in and out without ever
loading `/invoice`. Change one and change the other, or the page locks itself
out of its own sheet.

## Switching on the shared sheet

The ledger endpoint lives in `fomo/setup/apps-script.gs`, alongside the receiver
the fomo forms already use. It writes an `invoice` tab and an `hours` tab in the
same sheet, through the same deployment, so there is no second URL.

1. Open the sheet → **Extensions → Apps Script**.
2. Replace `Code.gs` with the current `fomo/setup/apps-script.gs`.
3. **Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy**.
4. Nothing. On `'auto'` the page picks it up by itself on the next load, and
   offers to carry that browser's ledger up with it.

> **This is already done.** The live deployment
> (`AKfycbxDR-3zqJEQgFEY0a-…`) was moved to a new version on Sep 10, 2026 and
> the endpoint reports `ledger`, `clock` and `shiftimport` all true. The steps
> above are here for the next time the script changes.
>
> The reason it was needed is worth remembering, because it will happen again.
> The project had **two active deployments**. Somebody pasted the ledger code
> and cut a new version on Sep 9 — but that version went to the *other*
> deployment, and the URL this site actually calls stayed on Sep 7's forms-only
> code. From the outside it looked exactly like nothing had been deployed. When
> a redeploy seems to have no effect, check the deployment ID against `ENDPOINT`
> before touching anything else.

Step 3 is the one that matters. Apps Script serves the last *deployed* version,
not the last saved one, so pasting the code and hitting save changes nothing.

**Use Manage deployments, not New deployment.** "New deployment" mints a
*different* `/exec` URL and leaves the original — the one this site points at —
serving the old code, which looks exactly like nothing happened.

### Checking whether it took

Open the `/exec` URL itself in a browser:

    {"ok":true,"hint":"fomo campus form receiver is live","ledger":true,"clock":true,"shiftimport":true}

`ledger` and `clock` are the two halves of this tool, and `shiftimport` is the
carry-over described above. **`true` on all three means the deployed version is
the current one** — and it is the same check the page itself runs on every load
before deciding whether to go shared. If any is missing or `false`, that URL
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
| `note` | optional |
| `receipt` | a link, if one was pasted in — see below |
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

## Receipt photos

The receipt field takes a photo, not a link. On a phone it opens the camera
or the camera roll; on a laptop, the file picker. Tap the thumbnail in the
ledger to see the full shot, and Escape or a click outside closes it.

Photos are never stored at full size. A phone snap is two to five megabytes
and a browser's whole store is about five, so each one is drawn down to
1000px on its long edge and re-encoded as JPEG — a 260KB receipt lands
around 20KB, and a real camera photo around 100KB. That is roughly forty
receipts before the store fills.

When it does fill, the line is **not** added: the store is rolled back to
what was last written and the page says which. Nothing appears on screen
that was not saved. Deleting a line with a photo on it frees the room again.

Photos need `BACKEND = 'device'`. The sheet keeps a 500-character cell, not
an image, so on `'sheet'` the picker is switched off and says so rather than
taking a photo it would have to throw away. Rows carrying an old `https://`
receipt link still render as a link, either way.

## The clock

Press a name in when they arrive and out when they leave. The card runs a live
timer while someone is on the clock, and the hours panel below totals the week
and all time. Hours export to CSV separately from the money.

On the shared sheet these are everybody's clocks: the page re-reads them every
30 seconds, so a name pressed in on somebody else's laptop turns green here
without anyone reloading. A tab in the background stops both the ticking and
the re-reading — neither is worth doing to a screen nobody is looking at — and
does both the instant it comes back to the front, so what you are looking at
when you look at it is current rather than up to half a minute old.

On device storage they are only that browser's, and the line above the cards
says so rather than letting four empty cards read as four people not working.

Someone can only be clocked in once at a time — a second press is refused. A
shift nobody closed shows up in red after 16 hours, saying so rather than
quietly counting as a very long day; close it by clocking out, or delete the
row from the table.

## What everyone's pushing

A GitHub-style contribution map — week columns, days down, the same green ramp
— for the team together and then one each. Above it: the quarter's total,
today's, and the busiest single day. Hovering a square names the day and its
count.

`GH_DEFAULTS` at the top of the pushing code holds the usernames already known,
so nobody has to type them on their own machine. The handles are not
printed anywhere on the page — the cards carry names and counts only, and the
fields that hold them sit behind **Manage accounts**, closed by default and
closed again on save.

> That is tidiness, not secrecy. `GH_DEFAULTS` lives in this page's source, and
> this repository is public, so anyone who opens either can read the handles.
> Treat them as public, because they are. They seed the fields on a first
visit only; once someone edits or clears one in their browser, that stands.
Anyone not listed shows a dash rather than a zero, and no caption: no username
means nothing was measured, which is not the same as having pushed nothing.

Each person's default is applied to a browser once, and once more if it later
changes. Seeding only browsers that had never opened the page was wrong — anyone
already using it kept the roster from their first visit, so a name added to
`GH_DEFAULTS` never reached them. A username somebody deliberately clears still
stays cleared, and picking up a new name drops the cached counts so the next read
includes them.

### Where the numbers come from

Each linked account's **public repositories** are listed, the ones pushed inside
the window are read, and their commits are counted by day.

The public events feed looked like the obvious source and was the wrong one. It
no longer carries commit counts, it stops at 300 events, and — the reason it had
to go — it never backfills: commits pushed while a repo was private stay missing
from it permanently. An intern who had just made their repo public read as a
flat zero while committing daily.

Still no OAuth and no token. Public commits need neither, and a token on a page
this public would be a liability. The limits that come with that, stated rather
than papered over:

- **Private repositories are invisible.** Nothing counts until a repo is public,
  though making it public later does bring its whole history in.
- **Commits to someone else's repository don't count** — only repos one of the
  linked accounts owns.
- **A person can hold more than one account.** Jesse's repository is owned by one
  login while every commit in it is authored by another, so either name alone
  counts nothing. Separate them with a comma and both are read: repositories are
  taken from all of them, and a commit counts when its author is any of them.
- **Very long histories are a floor.** Six repos per account, three pages of
  commits each; past that the number carries a `+` and the footer says why.

Unauthenticated GitHub allows 60 requests an hour **per viewer's IP**, not per
site, so everyone has their own budget. A refresh costs a few requests per
account, results cache for fifteen minutes and survive a reload — failures
included, so a mistyped username reads as a mistake rather than a quiet zero.
If the limit is hit the panel says so and names the minute it resets.

## Changing the team

`PEOPLE` at the top of the page's script, and `INVOICE_PEOPLE` in the Apps
Script, are the same four names. Change both — the endpoint refuses a name it
doesn't recognise, on a spend and on a clock-in alike.
