import {fetchChapterSnapshot,chapterSourceErrorCode} from '../server/campuswars-source.mjs';

// One upstream read per warm instance per 30 seconds; concurrent requests share it.
let latest = null, pending = null;
export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({error:'Method not allowed'}); }
  if (!process.env.CAMPUSWARS_ADMIN_PASSWORD) return res.status(503).json({error:'Live chapter updates are not configured'});
  try {
    if (!latest || Date.now() - Date.parse(latest.updatedAt) >= 30000) {
      pending ??= fetchChapterSnapshot({password:process.env.CAMPUSWARS_ADMIN_PASSWORD, username:process.env.CAMPUSWARS_ADMIN_USERNAME || 'village'}).then(value => latest = value).finally(() => pending = null);
      await pending;
    }
    return res.status(200).json(latest);
  } catch(error) {
    // Do not include upstream HTML, credentials or private records in errors.
    return res.status(502).json({error:'Chapter updates are temporarily unavailable',code:chapterSourceErrorCode(error)});
  }
}
