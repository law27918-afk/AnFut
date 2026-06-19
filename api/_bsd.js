const BASE = 'https://sports.bzzoiro.com/api/v2';

export async function bsd(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Token ${process.env.BSD_API_KEY}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BSD ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  // La API devuelve {count, results:[...]} o directamente el objeto
  return data?.results !== undefined ? data.results : data;
}
