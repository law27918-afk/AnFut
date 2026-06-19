export default async function handler(req, res) {
  const key = process.env.BSD_API_KEY;
  const r = await fetch('https://sports.bzzoiro.com/api/v2/leagues/?limit=1', {
    headers: { 'Authorization': `Token ${key}`, 'Accept': 'application/json' }
  });
  const text = await r.text();
  res.status(200).json({
    http_status: r.status,
    key_present: !!key,
    key_prefix: key ? key.slice(0,8)+'...' : null,
    body: text.slice(0, 300)
  });
}
