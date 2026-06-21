import { bsd } from './_bsd.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Accept ?date=YYYY-MM-DD (Panama time). Defaults to today Panama.
    let dateStr = req.query.date;

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Compute today in Panama (UTC-5)
      const now = new Date();
      const panama = new Date(now.getTime() - 5 * 60 * 60 * 1000);
      dateStr = panama.toISOString().split('T')[0];
    }

    // Panama midnight = UTC+5:00, Panama 23:59 = UTC next day 04:59
    const dateFrom = dateStr + 'T05:00:00Z';
    const [y, m, d] = dateStr.split('-').map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    const dateTo = next.toISOString().split('T')[0] + 'T04:59:59Z';

    const events = await bsd('/events/', {
      date_from: dateFrom,
      date_to:   dateTo,
      limit: 200,
    });

    const list = (Array.isArray(events) ? events : [])
      .filter(e => {
        const panama = new Date(new Date(e.event_date).getTime() - 5 * 60 * 60 * 1000);
        return panama.toISOString().split('T')[0] === dateStr;
      })
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    res.status(200).json({ date: dateStr, events: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
