import { bsd } from './_bsd.js';
export default async function handler(req, res) {
  const data = await bsd('/events/9054/stats/');
  res.status(200).json(data);
}
