export default async function handler(req, res) {
  try {
    const { bsd } = await import('./_bsd.js');
    const result = await bsd('/teams/', { name: 'Barcelona', limit: 3 });
    res.status(200).json({ ok: true, result });
  } catch(e) {
    res.status(200).json({ ok: false, error: e.message, stack: e.stack?.slice(0,300) });
  }
}
