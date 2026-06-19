import { bsd } from './_bsd.js';

async function safe(promise, label) {
  try {
    return { ok: true, data: await promise };
  } catch (e) {
    return { ok: false, label, error: e.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id || isNaN(parseInt(id))) return res.status(400).json({ error: 'Invalid event id' });

  const eid = parseInt(id);

  // Fire all requests in parallel
  const [
    event,
    stats,
    lineups,
    odds,
    oddsComparison,
    prediction,
    h2h,
    incidents,
    metadata,
    playerStats,
  ] = await Promise.all([
    safe(bsd(`/events/${eid}/`),                    'event'),
    safe(bsd(`/events/${eid}/stats/`),              'stats'),
    safe(bsd(`/events/${eid}/lineups/`),            'lineups'),
    safe(bsd(`/events/${eid}/odds/`),               'odds'),
    safe(bsd(`/events/${eid}/odds/comparison/`),    'oddsComparison'),
    safe(bsd(`/events/${eid}/prediction/`),         'prediction'),
    safe(bsd(`/events/${eid}/h2h/`),                'h2h'),
    safe(bsd(`/events/${eid}/incidents/`),          'incidents'),
    safe(bsd(`/events/${eid}/metadata/`),           'metadata'),
    safe(bsd(`/events/${eid}/player-stats/`),       'playerStats'),
  ]);

  // Also fetch team fixtures for recent form (last 6 matches each)
  let homeForm = { ok: false };
  let awayForm = { ok: false };

  if (event.ok) {
    const past = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const now  = new Date().toISOString();
    const { home_team_id, away_team_id } = event.data;

    [homeForm, awayForm] = await Promise.all([
      safe(bsd(`/teams/${home_team_id}/fixtures/`, { date_to: now, date_from: past, status: 'finished', limit: 6 }), 'homeForm'),
      safe(bsd(`/teams/${away_team_id}/fixtures/`, { date_to: now, date_from: past, status: 'finished', limit: 6 }), 'awayForm'),
    ]);
  }

  res.status(200).json({
    event:          event.ok          ? event.data          : null,
    stats:          stats.ok          ? stats.data          : null,
    lineups:        lineups.ok        ? lineups.data        : null,
    odds:           odds.ok           ? odds.data           : null,
    oddsComparison: oddsComparison.ok ? oddsComparison.data : null,
    prediction:     prediction.ok     ? prediction.data     : null,
    h2h:            h2h.ok            ? h2h.data            : null,
    incidents:      incidents.ok      ? incidents.data      : null,
    metadata:       metadata.ok       ? metadata.data       : null,
    playerStats:    playerStats.ok    ? playerStats.data    : null,
    homeForm:       homeForm.ok       ? homeForm.data       : null,
    awayForm:       awayForm.ok       ? awayForm.data       : null,
    errors: [event, stats, lineups, odds, oddsComparison, prediction, h2h, incidents, metadata, playerStats, homeForm, awayForm]
      .filter(r => !r.ok)
      .map(r => ({ endpoint: r.label, error: r.error })),
  });
}
