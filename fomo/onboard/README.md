# The clan portal

`/fomo/onboard/` closes the one gap the Greek Wars campaign leaves open.

A chapter signs up on the Greek Wars site. We get their members' emails. And
then nothing happens — those people are on a list, not on fomo, and not in
their chapter's clan. This page is the step in between, and it is the only
place the two halves meet.

It is deliberately **not wired to fomo's database**. As it ships it is the
missing wire done by hand: a student's fomo username lands in the campus
sheet next to the chapter they signed up with, and someone at fomo adds them.
Everything needed to make it official is already built and switched off,
waiting on four values from fomo. See [The seam](#the-seam).

---

## How a student sees it

One screen, three steps, about forty seconds of typing.

1. **Get fomo.** A store button, and a promise that leaving the page costs
   them nothing — everything typed so far is written to the browser on each
   keystroke and restored when they come back. This is the step that loses
   people, so it is the step that had the most care put into it.
2. **Their fomo username.** The whole point of the page. The `@` lives in the
   box, and `@JackD`, `  Jack.D  ` and `JACKD` all land in the sheet as one
   spelling.
3. **Name, email, phone.** Enough to match them to the signup row they are
   already on. The phone is there because email is what failed the first time.

Then: *you're on the list*, and a link to send to the rest of the house.

## The link carries the chapter

`/fomo/onboard/?c=sigma-chi-sdsu` opens with Sigma Chi already chosen — their own
letters at the top, no dropdown to get wrong. That is the whole trick: paste
one link into one house's group chat and every member who opens it is already
sorted.

Chapter ids come from the live Greek Wars feed (`/api/campuswars`), the same
one the village reads, so **a house that registers on Arya's site has a
working link here on the next page load, with nothing deployed**. When the
feed is down the bundled `chapters.json` stands in; when both fail the page
asks them to type the chapter rather than dying.

Open `/fomo/onboard/` with no `?c=` and they get a searchable list instead.

**[`/fomo/onboard/links/`](links/)** is the internal page that prints one link per
registered chapter, with a *message* button that copies a ready-to-paste line
of text plus the link. Not linked from anywhere public.

## Where answers land

The same Google Apps Script endpoint the other forms use, in a new tab called
`onboard` — see [`fomo/setup/README.md`](../setup/README.md). No new
credentials, no new infrastructure.

| column | |
| --- | --- |
| `received`, `page` | added by the script |
| `clan`, `school`, `clan id` | from the link, not typed |
| `fomo username` | normalised — no `@`, no spaces, lower case |
| `full name`, `email`, `phone` | |
| `username checked` | `found` / `not found` / `unchecked` — see the seam |

That is one row per person, carrying both halves of the mapping: the email
they signed up with, and the fomo account to put in the clan.

---

## The seam

Everything below is off. Fill any of it in at the top of
[`index.html`](index.html) — look for `const FOMO` — and the page upgrades
itself around it. Leave it blank and the manual path stays exactly as it is.
Nothing here ever claims a step happened that did not: an endpoint that fails
is reported, and the answers still reach the sheet.

```js
const FOMO = {
  app:            'https://fomo.family',
  ios:            'https://apps.apple.com/…/id6741115427',
  android:        'https://play.google.com/…?id=family.fomo.app',
  verifyUsername: '',
  clanLink:       '',
  joinEndpoint:   '',
  clanIds:        {}
};
```

**`app` / `ios` / `android`** — where *download fomo* goes: **fomo — never
miss out**, by FOMO Labs Inc. ([App Store][ios], [Google Play][play]). The
button picks the store off the phone it is opened on; anything that is
neither iPhone nor Android gets `app`, which is fomo.family.

[ios]: https://apps.apple.com/us/app/fomo-never-miss-out/id6741115427
[play]: https://play.google.com/store/apps/details?id=family.fomo.app

**`verifyUsername`** — `GET <url>?username=jackd` answering
`{"exists": true}`. Turns step 2 into a live check, so a handle nobody can
find is caught while the student is still on the page instead of three days
later by whoever is doing the adding. The answer travels to the sheet as
`username checked`. A handle that comes back unknown still submits — a check
that is down must not cost us the person.

**`clanLink`** — the one that matters. A link that opens the app on a clan,
e.g. `https://fomo.family/clan/{clan}`. Fill it in and the last screen stops
saying *somebody will add you* and becomes a button that puts them in the
clan themselves. `{clan}` is replaced with the fomo clan id from `clanIds`,
falling back to our own chapter id.

**`joinEndpoint`** — `POST <url>` with the whole mapping as JSON
(`fomo_username`, `clan_id`, `chapter_id`, `chapter`, `school`, `full_name`,
`email`, `phone`, `username_checked`). Records the join on fomo's side as
well as in the sheet. It runs *after* the sheet has already accepted the
answer and its failure is invisible to the student, because the row is what
guarantees they are not lost.

**`clanIds`** — our chapter id → fomo's clan id, for the two above. Our ids
come from the Greek Wars admin: `sigma-chi-sdsu` for the original five,
`chapter-<uuid>` for houses registered since. Anything not listed falls
through unchanged.

```js
clanIds: { 'sigma-chi-sdsu': 'fomo-clan-id-here' }
```

Wire up `clanLink` alone and the portal stops being a waiting list.
