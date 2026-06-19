import { bsd } from './_bsd.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { team_name, date_from, date_to, league_id, limit = 20 } = req.query;

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const events = await bsd('/events/', {
      team_name,
      date_from: date_from || now.toISOString(),
      date_to:   date_to   || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      league_id,
      limit,
      status: 'notstarted',
    });

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
