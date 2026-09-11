// Password gate for milomessina.com and every subsite under it.
//
// Vercel Edge Middleware runs before anything is served, so this covers the
// homepage, /cars, /fomo and its subpages, /fomoportal, /photos, /invoice,
// /landingpage, /assets and /api alike. Nothing behind it is reachable without
// the password.
//
// The password is never stored in this file. The unlock page hashes what the
// visitor types, together with SALT, and keeps the result in a cookie; this
// only ever compares that hash with TOKEN.

const SALT = 'milomessina-gate-v1';
const TOKEN = '7ce009efa969db550efc2baf8d9a43896f7820fd4993b318715e7d9a2d5dde5e';
const COOKIE = 'mm_gate';
const MAX_AGE = 60 * 60 * 24 * 30; // a month, then ask again

export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const cookies = request.headers.get('cookie') || '';
  const token = cookies.split(';').map(part => part.trim())
    .find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);

  if (token === TOKEN) return; // unlocked — let the request through untouched

  // A stale or wrong cookie means someone already had a go at the password.
  const retry = Boolean(token);
  return new Response(unlockPage(retry), {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      // Clear a bad cookie so a reload starts clean.
      ...(retry ? { 'set-cookie': `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax` } : {}),
    },
  });
}

function unlockPage(retry) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>milo messina</title>
<meta name="theme-color" content="#0F1A22">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23F5F0E6'/%3E%3Ctext x='50' y='67' font-family='Helvetica,Arial,sans-serif' font-size='50' font-weight='700' fill='%2317150F' text-anchor='middle'%3Emm%3C/text%3E%3C/svg%3E">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:#0F1A22;color:#17150F;display:grid;place-items:center;padding:24px;
  font:15px/1.5 system-ui,-apple-system,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}
body::after{content:'';position:fixed;inset:0;pointer-events:none;opacity:.11;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")}
.card{position:relative;z-index:1;width:100%;max-width:340px;background:#F6F1E7;border-radius:14px;padding:26px 24px 22px;
  box-shadow:0 2px 6px rgba(0,0,0,.18),0 18px 44px -12px rgba(0,0,0,.42),0 40px 90px -30px rgba(0,0,0,.5)}
.mark{width:34px;height:34px;border-radius:10px;background:#17150F;color:#F5F0E6;display:grid;place-items:center;
  font-size:.72rem;font-weight:700;letter-spacing:-.03em;margin-bottom:16px}
h1{font-size:1.02rem;font-weight:600;letter-spacing:-.01em}
p{color:#6E6759;font-size:.85rem;margin-top:5px}
form{margin-top:18px;display:flex;flex-direction:column;gap:9px}
label{font-size:.74rem;font-weight:600;color:#3A352B;letter-spacing:.02em;text-transform:uppercase}
input{width:100%;padding:10px 12px;font:inherit;color:#17150F;background:#fff;
  border:1px solid rgba(23,21,15,.26);border-radius:8px}
input:focus{outline:2px solid #2F5DD8;outline-offset:1px;border-color:transparent}
button{padding:10px 12px;font:inherit;font-weight:600;color:#F6F1E7;background:#17150F;
  border:none;border-radius:8px;cursor:pointer}
button:hover{background:#3A352B}
.err{min-height:1.1em;font-size:.8rem;color:#E5321E}
</style>
</head>
<body>
<main class="card">
  <div class="mark">mm</div>
  <h1>This site is private</h1>
  <p>Enter the password to continue.</p>
  <form id="f">
    <label for="p">Password</label>
    <input id="p" type="password" autocomplete="current-password" autofocus required>
    <div class="err" id="e">${retry ? 'That password was not right. Try again.' : ''}</div>
    <button type="submit">Unlock</button>
  </form>
</main>
<script>
const form = document.getElementById('f');
const field = document.getElementById('p');
const error = document.getElementById('e');
form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  // Hash here so the password itself never leaves the browser.
  const bytes = new TextEncoder().encode(${JSON.stringify(SALT)} + ':' + field.value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const token = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  document.cookie = ${JSON.stringify(COOKIE)} + '=' + token +
    '; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  location.reload();
});
</script>
</body>
</html>`;
}
