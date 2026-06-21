// api/testplayer.js
import { bsd } from './_bsd.js';
export default async function handler(req, res) {
  // USA vs Belgium - partido terminado que ya usamos
  const data = await bsd('/events/9054/player-stats/');
  res.status(200).json(data);
}
