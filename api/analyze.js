import { bsd, safe } from './_bsd.js';

// Calcula estadísticas de los últimos N partidos de un equipo
function calcStats(fixtures, teamId) {
  const games = fixtures.filter(f =>
    f.status === 'finished' &&
    f.home_score !== null &&
    f.away_score !== null
  ).slice(0, 10);

  if (!games.length) return null;

  let wins = 0, draws = 0, losses = 0;
  let goalsFor = 0, goalsAgainst = 0;
  let btts = 0, over15 = 0, over25 = 0, over35 = 0;
  let cleanSheets = 0;
  const form = [];

  games.forEach(f => {
    const isHome = f.home_team_id === teamId;
    const gf = isHome ? f.home_score : f.away_score;
    const ga = isHome ? f.away_score : f.home_score;
    const total = gf + ga;

    goalsFor += gf;
    goalsAgainst += ga;

    if (gf > ga) { wins++; form.push('W'); }
    else if (gf === ga) { draws++; form.push('D'); }
    else { losses++; form.push('L'); }

    if (gf > 0 && ga > 0) btts++;
    if (total > 1) over15++;
    if (total > 2) over25++;
    if (total > 3) over35++;
    if (ga === 0) cleanSheets++;
  });

  const n = games.length;
  return {
    games: n,
    wins, draws, losses,
    win_pct: Math.round(wins / n * 100),
    draw_pct: Math.round(draws / n * 100),
    loss_pct: Math.round(losses / n * 100),
    avg_goals_for: +(goalsFor / n).toFixed(2),
    avg_goals_against: +(goalsAgainst / n).toFixed(2),
    avg_total_goals: +((goalsFor + goalsAgainst) / n).toFixed(2),
    btts_pct: Math.round(btts / n * 100),
    over15_pct: Math.round(over15 / n * 100),
    over25_pct: Math.round(over25 / n * 100),
    over35_pct: Math.round(over35 / n * 100),
    clean_sheet_pct: Math.round(cleanSheets / n * 100),
    form: form.slice(0, 6),
    recent: games.slice(0, 6).map(f => {
      const isHome = f.home_team_id === teamId;
      return {
        opponent: isHome ? f.away_team : f.home_team,
        home: isHome,
        gf: isHome ? f.home_score : f.away_score,
        ga: isHome ? f.away_score : f.home_score,
        date: f.event_date?.split('T')[0],
      };
    }),
  };
}

// Genera recomendaciones de apuesta basadas en estadísticas combinadas
function generateBets(homeStats, awayStats, odds, prediction) {
  const bets = [];

  if (!homeStats || !awayStats) return bets;

  const avgBTTS = (homeStats.btts_pct + awayStats.btts_pct) / 2;
  const avgOver25Home = homeStats.over25_pct;
  const avgOver25Away = awayStats.over25_pct;
  const avgOver25 = (avgOver25Home + avgOver25Away) / 2;
  const avgOver15 = (homeStats.over15_pct + awayStats.over15_pct) / 2;
  const avgGoals = (homeStats.avg_total_goals + awayStats.avg_total_goals) / 2;

  // BTTS
  const bttsOdd = odds?.btts_yes;
  const bttsProb = avgBTTS / 100;
  const bttsEV = bttsOdd ? +(bttsProb * bttsOdd - 1).toFixed(3) : null;
  bets.push({
    market: 'Ambos Marcan (BTTS Sí)',
    prob: avgBTTS,
    confidence: avgBTTS >= 60 ? 'ALTA' : avgBTTS >= 45 ? 'MEDIA' : 'BAJA',
    odds: bttsOdd || null,
    ev: bttsEV,
    reason: `${homeStats.btts_pct}% en local, ${awayStats.btts_pct}% en visitante (últimos 10)`,
    recommend: avgBTTS >= 55,
  });

  // Over 2.5
  const o25Odd = odds?.over25;
  const o25Prob = avgOver25 / 100;
  const o25EV = o25Odd ? +(o25Prob * o25Odd - 1).toFixed(3) : null;
  bets.push({
    market: 'Over 2.5 Goles',
    prob: Math.round(avgOver25),
    confidence: avgOver25 >= 60 ? 'ALTA' : avgOver25 >= 45 ? 'MEDIA' : 'BAJA',
    odds: o25Odd || null,
    ev: o25EV,
    reason: `Promedio ${avgGoals.toFixed(1)} goles/partido combinado. Over 2.5: ${Math.round(avgOver25)}%`,
    recommend: avgOver25 >= 55,
  });

  // Over 1.5
  bets.push({
    market: 'Over 1.5 Goles',
    prob: Math.round(avgOver15),
    confidence: avgOver15 >= 75 ? 'ALTA' : avgOver15 >= 60 ? 'MEDIA' : 'BAJA',
    odds: odds?.over15 || null,
    ev: null,
    reason: `Over 1.5 se dio en ${Math.round(avgOver15)}% de partidos recientes`,
    recommend: avgOver15 >= 70,
  });

  // Resultado
  const homePred = prediction?.markets?.match_result?.prob_home;
  const drawPred = prediction?.markets?.match_result?.prob_draw;
  const awayPred = prediction?.markets?.match_result?.prob_away;

  if (homePred != null) {
    // homePred es 0-1, homeStats.win_pct es 0-100 → normalizar a 0-1 antes de combinar
    const homeFormPct = homeStats.win_pct / 100;
    const awayFormPct = awayStats.win_pct / 100;
    // Promedio ponderado: 60% modelo ML + 40% forma reciente → resultado en 0-100
    const homeAdj = Math.round(((homePred * 0.6) + (homeFormPct * 0.4)) * 100);
    const awayAdj = Math.round(((awayPred * 0.6) + (awayFormPct * 0.4)) * 100);
    const drawAdj = Math.round(drawPred * 100);

    const homeOdd = odds?.home;
    const awayOdd = odds?.away;
    const drawOdd = odds?.draw;

    bets.push({
      market: `Victoria Local`,
      prob: homeAdj,
      confidence: homeAdj >= 55 ? 'ALTA' : homeAdj >= 40 ? 'MEDIA' : 'BAJA',
      odds: homeOdd || null,
      ev: homeOdd ? +((homeAdj/100) * homeOdd - 1).toFixed(3) : null,
      reason: `Modelo ML: ${Math.round(homePred*100)}% + forma reciente: ${homeStats.win_pct}% victorias`,
      recommend: homeAdj >= 50 && homeAdj > awayAdj + 10,
    });

    bets.push({
      market: `Empate`,
      prob: drawAdj,
      confidence: drawAdj >= 30 ? 'MEDIA' : 'BAJA',
      odds: drawOdd || null,
      ev: drawOdd ? +((drawAdj/100) * drawOdd - 1).toFixed(3) : null,
      reason: `Modelo ML: ${Math.round(drawPred*100)}%. Local empata ${homeStats.draw_pct}%, visitante ${awayStats.draw_pct}%`,
      recommend: drawAdj >= 35 && homeStats.draw_pct >= 30 && awayStats.draw_pct >= 30,
    });

    bets.push({
      market: `Victoria Visitante`,
      prob: awayAdj,
      confidence: awayAdj >= 55 ? 'ALTA' : awayAdj >= 40 ? 'MEDIA' : 'BAJA',
      odds: awayOdd || null,
      ev: awayOdd ? +((awayAdj/100) * awayOdd - 1).toFixed(3) : null,
      reason: `Modelo ML: ${Math.round(awayPred*100)}% + forma reciente: ${awayStats.win_pct}% victorias`,
      recommend: awayAdj >= 50 && awayAdj > homeAdj + 10,
    });
  }

  // Ordena por probabilidad descendente
  return bets.sort((a, b) => b.prob - a.prob);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing event id' });

  try {
    // Carga evento + predicción + odds en paralelo
    const [event, prediction, oddsData] = await Promise.all([
      safe(bsd(`/events/${id}/`)),
      safe(bsd(`/events/${id}/prediction/`)),
      safe(bsd(`/events/${id}/odds/comparison/`)),
    ]);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const past60 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Últimos 10 partidos de cada equipo (terminados)
    const [homeFixtures, awayFixtures, h2h, lineups] = await Promise.all([
      safe(bsd(`/teams/${event.home_team_id}/fixtures/`, {
        date_from: past60, date_to: now, status: 'finished', limit: 10
      })),
      safe(bsd(`/teams/${event.away_team_id}/fixtures/`, {
        date_from: past60, date_to: now, status: 'finished', limit: 10
      })),
      safe(bsd(`/events/${id}/h2h/`)),
      safe(bsd(`/events/${id}/lineups/`)),
    ]);

    const homeStats = calcStats(homeFixtures || [], event.home_team_id);
    const awayStats = calcStats(awayFixtures || [], event.away_team_id);

    // Extrae cuotas clave del comparison
    const markets = oddsData?.markets || {};
    const odds = {
      home:   markets['1x2']?.HOME?.consensus?.decimal_odds || null,
      draw:   markets['1x2']?.DRAW?.consensus?.decimal_odds || null,
      away:   markets['1x2']?.AWAY?.consensus?.decimal_odds || null,
      over25: markets['over_under_25']?.over?.consensus?.decimal_odds || null,
      under25:markets['over_under_25']?.under?.consensus?.decimal_odds || null,
      over15: markets['over_under_15']?.over?.consensus?.decimal_odds || null,
      btts_yes: markets['btts']?.yes?.consensus?.decimal_odds || null,
      btts_no:  markets['btts']?.no?.consensus?.decimal_odds || null,
    };

    const bets = generateBets(homeStats, awayStats, odds, prediction);

    res.status(200).json({
      event,
      homeStats,
      awayStats,
      odds,
      prediction,
      h2h,
      lineups,
      bets,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
