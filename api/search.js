import { bsd } from './_bsd.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ error: 'Query too short' });

  try {
    const teams = await bsd('/teams/', { name: q, limit: 8 });

    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const fixturePromises = teams.slice(0, 4).map(team =>
      bsd(`/teams/${team.id}/fixtures/`, {
        date_from: now.toISOString(),
        date_to: twoWeeks.toISOString(),
        limit: 5,
      })
      .then(fixtures => ({ team, fixtures: Array.isArray(fixtures) ? fixtures : [] }))
      .catch(() => ({ team, fixtures: [] }))
    );

    const results = await Promise.all(fixturePromises);

    res.status(200).json({ teams, fixtures: results });

  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
