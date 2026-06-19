import { bsd } from './_bsd.js';

// Fecha local en Panamá (UTC-5) como YYYY-MM-DD
function panamaDate(offsetDays = 0) {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() - 5); // UTC-5
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const todayStr    = panamaDate(0);
    const tomorrowStr = panamaDate(1);

    // Pide desde inicio de hoy hasta fin de mañana en UTC
    const dateFrom = todayStr + 'T05:00:00Z';   // 00:00 Panamá = 05:00 UTC
    const dateTo   = tomorrowStr + 'T04:59:59Z'; // 23:59 mañana Panamá = 04:59 UTC+1d
    const dateToReal = panamaDate(2) + 'T04:59:59Z';

    const events = await bsd('/events/', {
      date_from: dateFrom,
      date_to:   dateToReal,
      limit: 200,
    });

    const grouped = { today: [], tomorrow: [] };

    (Array.isArray(events) ? events : []).forEach(e => {
      // Convierte event_date a fecha Panamá
      const utc = new Date(e.event_date);
      const panama = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
      const d = panama.toISOString().split('T')[0];
      if (d === todayStr) grouped.today.push(e);
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
