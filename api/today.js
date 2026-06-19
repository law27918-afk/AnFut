import { bsd } from './_bsd.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateFrom = now.toISOString().split('T')[0]; // YYYY-MM-DD hoy
    const dateTo = tomorrow.toISOString().split('T')[0] + 'T23:59:59Z'; // mañana fin

    const events = await bsd('/events/', {
      date_from: dateFrom,
      date_to: dateTo,
      limit: 100,
    });

    // Agrupa por fecha
    const today = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const grouped = { today: [], tomorrow: [] };

    (Array.isArray(events) ? events : []).forEach(e => {
      const d = e.event_date?.split('T')[0];
      if (d === today) grouped.today.push(e);
      else if (d === tomorrowStr) grouped.tomorrow.push(e);
    });

    // Ordena por hora
    grouped.today.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    grouped.tomorrow.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
