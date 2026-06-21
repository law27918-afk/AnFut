import { bsd, safe } from './_bsd.js';

// ═══════════════════════════════════════════════════════════════
// MATH UTILITIES
// ═══════════════════════════════════════════════════════════════

function poissonPmf(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function wilsonCI(k, n) {
  if (!n) return [0, 100];
  const z = 1.96, p = k / n;
  const d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d;
  const s = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return [Math.max(0, Math.round((c - s) * 100)), Math.min(100, Math.round((c + s) * 100))];
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ═══════════════════════════════════════════════════════════════
// REAL HOME ADVANTAGE
// Neutral grounds (World Cup, Euros, Copa América, finals) = 0
// Home team in own country = full advantage
// Partial: nearby country, same continent
// ═══════════════════════════════════════════════════════════════

// International tournaments that neutralize home advantage
const NEUTRAL_COMPETITIONS = [27, 28, 29, 30, 31, 32, 33]; // World Cup, major intl

function realHomeAdvantage(event) {
  if (event.is_neutral_ground) return 0;

  // If competition is international tournament → reduce significantly
  const leagueId = event.league_id;
  if (NEUTRAL_COMPETITIONS.includes(leagueId)) return 1; // minimal

  // If travel distance is very small → high home advantage
  const dist = event.travel_distance_km;
  if (dist === null || dist === undefined) return 5; // default moderate

  if (dist < 50)   return 9;
  if (dist < 200)  return 8;
  if (dist < 500)  return 7;
  if (dist < 1000) return 6;
  if (dist < 2000) return 4;
  if (dist < 4000) return 2;
  return 1; // intercontinental travel
}

// ═══════════════════════════════════════════════════════════════
// RECENCY WEIGHTED STATS
// Últimos 3 = 40%, 4-6 = 30%, 7-10 = 20%, 11-15 = 10%
// ═══════════════════════════════════════════════════════════════

function recencyWeights(n) {
  const w = [];
  for (let i = 0; i < n; i++) {
    if (i < 3)       w.push(0.40 / Math.min(3,  n));
    else if (i < 6)  w.push(0.30 / Math.min(3,  n - 3));
    else if (i < 10) w.push(0.20 / Math.min(4,  n - 6));
    else             w.push(0.10 / Math.min(5,  n - 10));
  }
  const total = w.reduce((a, b) => a + b, 0);
  return w.map(x => x / total);
}

// ═══════════════════════════════════════════════════════════════
// STATS ENGINE — context-aware, recency-weighted
// ═══════════════════════════════════════════════════════════════

function calcStats(fixtures, teamId) {
  const finished = (fixtures || [])
    .filter(f => f.status === 'finished' && f.home_score !== null && f.away_score !== null)
    .slice(0, 15);

  if (!finished.length) return null;

  function aggregate(games) {
    if (!games.length) return null;
    const n = games.length;
    const weights = recencyWeights(n);

    let wWins=0, wDraws=0, wLosses=0;
    let wGf=0, wGa=0;
    let wBtts=0, wO15=0, wO25=0, wO35=0, wCs=0;
    let formPts = 0;
    const form = [];
    const recent = [];

    games.forEach((f, i) => {
      const isH = f.home_team_id === teamId;
      const gf = isH ? f.home_score : f.away_score;
      const ga = isH ? f.away_score : f.home_score;
      const total = gf + ga;
      const w = weights[i];

      wGf += gf * w; wGa += ga * w;
      if (gf > ga) { wWins += w; formPts += 3 * w; form.push('W'); }
      else if (gf === ga) { wDraws += w; formPts += 1 * w; form.push('D'); }
      else { wLosses += w; form.push('L'); }

      if (gf > 0 && ga > 0) wBtts += w;
      if (total > 1) wO15 += w;
      if (total > 2) wO25 += w;
      if (total > 3) wO35 += w;
      if (ga === 0)  wCs  += w;

      if (recent.length < 6) {
        recent.push({
          opponent: isH ? f.away_team : f.home_team,
          home: isH,
          gf, ga,
          date: f.event_date?.split('T')[0],
          result: gf > ga ? 'W' : gf < ga ? 'L' : 'D',
        });
      }
    });

    return {
      n,
      win_pct:         Math.round(wWins * 100),
      draw_pct:        Math.round(wDraws * 100),
      loss_pct:        Math.round(wLosses * 100),
      form_pts_pct:    Math.round(formPts / 3 * 100),
      avg_gf:          +wGf.toFixed(2),
      avg_ga:          +wGa.toFixed(2),
      avg_total:       +(wGf + wGa).toFixed(2),
      btts_pct:        Math.round(wBtts * 100),
      over15_pct:      Math.round(wO15 * 100),
      over25_pct:      Math.round(wO25 * 100),
      over35_pct:      Math.round(wO35 * 100),
      clean_sheet_pct: Math.round(wCs * 100),
      btts_ci:         wilsonCI(games.filter((f,i) => { const isH = f.home_team_id === teamId; const gf=isH?f.home_score:f.away_score; const ga=isH?f.away_score:f.home_score; return gf>0&&ga>0; }).length, n),
      form: form.slice(0, 6),
      recent,
    };
  }

  const homeGames = finished.filter(f => f.home_team_id === teamId);
  const awayGames = finished.filter(f => f.away_team_id === teamId);

  const allStats  = aggregate(finished);
  const homeStats = aggregate(homeGames);
  const awayStats = aggregate(awayGames);

  return {
    ...allStats,
    home_ctx: homeStats,
    away_ctx: awayStats,
    sample_factor: clamp(finished.length / 15, 0, 1),
    finishedIds: finished.slice(0, 6).map(f => f.id),
  };
}

// ═══════════════════════════════════════════════════════════════
// POISSON ENGINE
// ═══════════════════════════════════════════════════════════════

function buildPoisson(homeStats, awayStats, prediction, homeAdvantage, mlConfidence) {
  const mc = mlConfidence || 0.3;

  // Base lambdas from weighted historical stats (use context-specific if available)
  const hCtx = homeStats.home_ctx || homeStats;
  const aCtx = awayStats.away_ctx || awayStats;

  // Base attack/defense rates
  let baseHomeAttack  = hCtx.avg_gf || homeStats.avg_gf || 1.2;
  let baseHomeDef     = hCtx.avg_ga || homeStats.avg_ga || 1.2;
  let baseAwayAttack  = aCtx.avg_gf || awayStats.avg_gf || 1.0;
  let baseAwayDef     = aCtx.avg_ga || awayStats.avg_ga || 1.0;

  // Adjust with xG from ML prediction if available
  const xgHome = prediction?.markets?.expected_goals?.home;
  const xgAway = prediction?.markets?.expected_goals?.away;

  // Blend historical with xG (weighted by model confidence)
  let lambda_home, lambda_away;

  if (xgHome != null && xgAway != null) {
    lambda_home = xgHome * mc + baseHomeAttack * (1 - mc);
    lambda_away = xgAway * mc + baseAwayAttack * (1 - mc);
  } else {
    lambda_home = baseHomeAttack;
    lambda_away = baseAwayAttack;
  }

  // Apply home advantage multiplier
  const haBoost = 1 + (homeAdvantage / 10) * 0.15; // max +15% boost at 10
  lambda_home *= haBoost;
  lambda_away /= (haBoost * 0.5 + 0.5); // slight penalty for away

  // Clamp to reasonable range
  lambda_home = clamp(lambda_home, 0.3, 4.0);
  lambda_away = clamp(lambda_away, 0.3, 4.0);

  // Generate score matrix (0-6 goals each)
  const MAX_G = 6;
  const scores = [];
  let homeWin = 0, draw = 0, awayWin = 0;

  for (let h = 0; h <= MAX_G; h++) {
    for (let a = 0; a <= MAX_G; a++) {
      const prob = poissonPmf(h, lambda_home) * poissonPmf(a, lambda_away);
      scores.push({ home: h, away: a, prob });
      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;
    }
  }

  // Normalize (accounts for truncation at 6)
  const total = homeWin + draw + awayWin;
  homeWin /= total; draw /= total; awayWin /= total;

  // Top 10 exact scores
  const top10 = scores
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 10)
    .map(s => ({ ...s, prob: +(s.prob * 100).toFixed(1) }));

  // Over/under probabilities from Poisson
  const o15 = scores.filter(s => s.home + s.away > 1).reduce((a, s) => a + s.prob, 0) / total;
  const o25 = scores.filter(s => s.home + s.away > 2).reduce((a, s) => a + s.prob, 0) / total;
  const o35 = scores.filter(s => s.home + s.away > 3).reduce((a, s) => a + s.prob, 0) / total;
  const btts = scores.filter(s => s.home > 0 && s.away > 0).reduce((a, s) => a + s.prob, 0) / total;

  return {
    lambda_home: +lambda_home.toFixed(3),
    lambda_away: +lambda_away.toFixed(3),
    home_win:  +(homeWin * 100).toFixed(1),
    draw:      +(draw * 100).toFixed(1),
    away_win:  +(awayWin * 100).toFixed(1),
    over15:    +(o15 * 100).toFixed(1),
    over25:    +(o25 * 100).toFixed(1),
    over35:    +(o35 * 100).toFixed(1),
    btts:      +(btts * 100).toFixed(1),
    top10_scores: top10,
    dnb_home:  +(homeWin / (homeWin + awayWin) * 100).toFixed(1),
    dnb_away:  +(awayWin / (homeWin + awayWin) * 100).toFixed(1),
    asian_home_0: +(homeWin * 100).toFixed(1),
    asian_away_0: +(awayWin * 100).toFixed(1),
  };
}

// ═══════════════════════════════════════════════════════════════
// ENSEMBLE MODEL
// Combines: Poisson + ML + Recent Form
// Weights adapt to available data quality
// ═══════════════════════════════════════════════════════════════

function ensembleProbs(poisson, mlPrediction, homeStats, awayStats, mlConfidence, sampleFactor) {
  const mc = mlConfidence || 0.3;
  const sf = sampleFactor || 0.3;

  // Weight each source by reliability
  const wPoisson = 0.45; // always present
  const wML      = mc * 0.35; // scales with confidence
  const wForm    = sf * 0.20; // scales with sample size
  const wTotal   = wPoisson + wML + wForm;

  // ML probabilities
  const mr = mlPrediction?.markets?.match_result || {};
  const mlH = (mr.prob_home || 33) / 100;
  const mlD = (mr.prob_draw || 33) / 100;
  const mlA = (mr.prob_away || 33) / 100;

  // Form-based probabilities
  const hCtx = homeStats.home_ctx || homeStats;
  const aCtx = awayStats.away_ctx || awayStats;
  const formH = (hCtx.win_pct || 33) / 100;
  const formA = (aCtx.win_pct || 33) / 100;
  const formD = 1 - formH - formA > 0 ? 1 - formH - formA : 0.25;

  // Poisson
  const poisH = poisson.home_win / 100;
  const poisD = poisson.draw / 100;
  const poisA = poisson.away_win / 100;

  // Weighted ensemble
  let ensH = (poisH * wPoisson + mlH * wML + formH * wForm) / wTotal;
  let ensD = (poisD * wPoisson + mlD * wML + formD * wForm) / wTotal;
  let ensA = (poisA * wPoisson + mlA * wML + formA * wForm) / wTotal;

  // Normalize
  const tot = ensH + ensD + ensA;
  ensH /= tot; ensD /= tot; ensA /= tot;

  return {
    home: +(ensH * 100).toFixed(1),
    draw: +(ensD * 100).toFixed(1),
    away: +(ensA * 100).toFixed(1),
    sources: {
      poisson: { h: +(poisH*100).toFixed(1), d: +(poisD*100).toFixed(1), a: +(poisA*100).toFixed(1), weight: Math.round(wPoisson/wTotal*100) },
      ml:      { h: +(mlH*100).toFixed(1),   d: +(mlD*100).toFixed(1),   a: +(mlA*100).toFixed(1),   weight: Math.round(wML/wTotal*100) },
      form:    { h: +(formH*100).toFixed(1), d: +(formD*100).toFixed(1), a: +(formA*100).toFixed(1), weight: Math.round(wForm/wTotal*100) },
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// VALUE BETS ENGINE
// ═══════════════════════════════════════════════════════════════

function calcValueBets(ensemble, poisson, prediction, odds, homeStats, awayStats, mlConf, sf) {
  const bets = [];

  function addBet(market, ourProb, bookOdds, reason, factors) {
    if (!bookOdds || ourProb <= 0) {
      // No odds available — still show prediction without EV
      bets.push({ market, prob: ourProb, odds: null, impliedProb: null, edge: null, ev: null, reason, factors, hasValue: false });
      return;
    }
    const impliedProb = 1 / bookOdds * 100;
    const edge = ourProb - impliedProb;
    const ev   = +(( ourProb/100 * bookOdds) - 1).toFixed(3);
    const hasValue = edge > 3; // minimum 3% edge
    bets.push({ market, prob: ourProb, odds: bookOdds, impliedProb: +impliedProb.toFixed(1), edge: +edge.toFixed(1), ev, reason, factors, hasValue });
  }

  const hCtx = homeStats.home_ctx || homeStats;
  const aCtx = awayStats.away_ctx || awayStats;

  // 1X2
  addBet('Victoria local',   ensemble.home, odds.home, `Ensemble ${ensemble.home}% (Poisson ${poisson.home_win}%, ML ${prediction?.markets?.match_result?.prob_home?.toFixed(1)||'N/D'}%)`,
    { favor: [`Forma local: ${hCtx.win_pct}% victorias`, `xG esperado: ${poisson.lambda_home}`], contra: [`Forma visitante: ${aCtx.win_pct}% victorias`] });

  addBet('Empate',            ensemble.draw, odds.draw, `Ensemble ${ensemble.draw}% (Poisson ${poisson.draw}%, ML ${prediction?.markets?.match_result?.prob_draw?.toFixed(1)||'N/D'}%)`,
    { favor: [`Empates recientes local: ${hCtx.draw_pct}%`, `Empates recientes visitante: ${aCtx.draw_pct}%`], contra: [`Partidos parejos son impredecibles`] });

  addBet('Victoria visitante', ensemble.away, odds.away, `Ensemble ${ensemble.away}% (Poisson ${poisson.away_win}%, ML ${prediction?.markets?.match_result?.prob_away?.toFixed(1)||'N/D'}%)`,
    { favor: [`Forma visitante: ${aCtx.win_pct}% victorias`, `xG visitante: ${poisson.lambda_away}`], contra: [`Ventaja de local`] });

  // Draw No Bet
  addBet('Draw No Bet — Local',    poisson.dnb_home, odds.home ? +(odds.home * (ensemble.home/100) / ((ensemble.home + ensemble.away)/100)).toFixed(2) : null,
    `Si no hay empate, gana local en ${poisson.dnb_home}% de escenarios`, { favor: [], contra: [] });

  // Goals
  const o25Prob = Math.round((poisson.over25 * 0.6 + (prediction?.markets?.over_under?.prob_over_25 || poisson.over25) * 0.4));
  addBet('Over 2.5 goles', o25Prob, odds.over25, `Poisson ${poisson.over25}% | xG combinado ${(+poisson.lambda_home + +poisson.lambda_away).toFixed(2)}`,
    { favor: [`Promedio histórico local: ${homeStats.avg_total} goles`, `Promedio histórico visitante: ${awayStats.avg_total} goles`], contra: [`Muestra: ${Math.min(homeStats.n, awayStats.n)} partidos`] });

  const o15Prob = Math.round((poisson.over15 * 0.6 + (prediction?.markets?.over_under?.prob_over_15 || poisson.over15) * 0.4));
  addBet('Over 1.5 goles', o15Prob, odds.over15, `Poisson ${poisson.over15}%`,
    { favor: [`Alta frecuencia histórica de goles`], contra: [] });

  // BTTS
  const bttsProb = Math.round((poisson.btts * 0.6 + (prediction?.markets?.btts?.prob_yes || poisson.btts) * 0.4));
  addBet('Ambos marcan', bttsProb, odds.btts_yes, `Poisson ${poisson.btts}% | Local BTTS ${homeStats.btts_pct}% | Visitante BTTS ${awayStats.btts_pct}%`,
    { favor: [`BTTS reciente local: ${hCtx.btts_pct||homeStats.btts_pct}%`, `BTTS reciente visitante: ${aCtx.btts_pct||awayStats.btts_pct}%`], contra: [`xGA local: ${poisson.lambda_away.toFixed(2)}`] });

  // Sort: value bets first, then by prob
  return bets.sort((a, b) => {
    if (a.hasValue && !b.hasValue) return -1;
    if (!a.hasValue && b.hasValue) return 1;
    return b.prob - a.prob;
  });
}

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE SCORE (redesigned)
// ═══════════════════════════════════════════════════════════════

function calcConfidence(homeStats, awayStats, lineups, prediction, event, poisson, ensemble) {
  let cs = 0;

  // Sample quality (25 pts)
  const minN = Math.min(homeStats?.n || 0, awayStats?.n || 0);
  cs += clamp(minN / 12, 0, 1) * 25;

  // Lineup availability (20 pts)
  const ls = lineups?.lineup_status;
  if (ls === 'confirmed') cs += 20;
  else if (ls === 'predicted') cs += 8;

  // Model confidence (15 pts)
  cs += (prediction?.model?.confidence || 0) * 15;

  // Ensemble spread — how much sources agree (20 pts)
  if (ensemble) {
    const src = ensemble.sources;
    const spreadH = Math.abs(src.poisson.h - src.ml.h) + Math.abs(src.poisson.h - src.form.h);
    cs += clamp(1 - spreadH / 40, 0, 1) * 20;
  }

  // Poisson separation — clear favorite = higher confidence (10 pts)
  if (poisson) {
    const maxP = Math.max(poisson.home_win, poisson.draw, poisson.away_win);
    const minP = Math.min(poisson.home_win, poisson.draw, poisson.away_win);
    cs += clamp((maxP - minP) / 40, 0, 1) * 10;
  }

  // Context data available (10 pts)
  const hasHomeCtx = homeStats?.home_ctx?.n > 3;
  const hasAwayCtx = awayStats?.away_ctx?.n > 3;
  if (hasHomeCtx) cs += 5;
  if (hasAwayCtx) cs += 5;

  // Penalties
  if (minN < 5)  cs -= 20;
  if (minN < 3)  cs -= 20;
  if (event?.is_neutral_ground) cs -= 3;

  return Math.max(0, Math.min(100, Math.round(cs)));
}

// ═══════════════════════════════════════════════════════════════
// TRAP SCORE (redesigned)
// ═══════════════════════════════════════════════════════════════

function calcTrap(homeStats, awayStats, lineups, prediction, event, h2h, ensemble) {
  let ts = 0;
  const reasons = [];

  const mc = prediction?.model?.confidence || 0;
  if (mc < 0.35) { ts += 2; reasons.push('Modelo ML de baja confianza'); }

  const minN = Math.min(homeStats?.n || 0, awayStats?.n || 0);
  if (minN < 5)  { ts += 2; reasons.push(`Muestra muy pequeña (${minN} partidos)`); }
  else if (minN < 8) { ts += 1; reasons.push(`Muestra pequeña (${minN} partidos)`); }

  if (lineups?.lineup_status !== 'confirmed') { ts += 1; reasons.push('Alineaciones no confirmadas'); }

  if (event?.is_neutral_ground) { ts += 1; reasons.push('Terreno neutral — sin ventaja local real'); }

  // Check if sources disagree significantly
  if (ensemble) {
    const { poisson: p, ml: m } = ensemble.sources;
    if (Math.abs(p.h - m.h) > 20) { ts += 1; reasons.push('Poisson y ML muy divergentes en local'); }
    if (Math.abs(p.a - m.a) > 20) { ts += 1; reasons.push('Poisson y ML muy divergentes en visitante'); }
  }

  // Unavailable key players
  const unavH = lineups?.unavailable_players?.home?.length || 0;
  const unavA = lineups?.unavailable_players?.away?.length || 0;
  if (unavH >= 2 || unavA >= 2) { ts += 1; reasons.push(`Bajas importantes (local: ${unavH}, visitante: ${unavA})`); }

  if (!h2h?.total_matches) { ts += 1; reasons.push('Sin historial H2H'); }

  return { score: Math.min(ts, 10), reasons };
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL STATS (corners, cards, offsides)
// ═══════════════════════════════════════════════════════════════

async function fetchHistoricalStats(eventIds) {
  if (!eventIds?.length) return null;

  const results = await Promise.all(
    eventIds.map(id => safe(bsd(`/events/${id}/stats/`)))
  );

  let corners=0, yellows=0, reds=0, offsides=0, count=0;
  const cL=[], yL=[], oL=[];

  results.forEach(stats => {
    if (!stats) return;
    const home = stats.stats?.home || stats.home || {};
    const away = stats.stats?.away || stats.away || {};

    const tc = (home.corner_kicks || 0) + (away.corner_kicks || 0);
    const ty = (home.yellow_cards || 0) + (away.yellow_cards || 0);
    const tr = (home.red_cards    || 0) + (away.red_cards    || 0);
    const to = (home.offsides     || 0) + (away.offsides     || 0);

    if (ty > 0 || to > 0 || tc > 0) {
      corners += tc; yellows += ty; reds += tr; offsides += to;
      count++;
      cL.push(tc); yL.push(ty); oL.push(to);
    }
  });

  if (!count) return null;

  const avgC = +(corners / count).toFixed(1);
  const avgY = +(yellows / count).toFixed(1);
  const avgO = +(offsides / count).toFixed(1);

  function overPct(list, line) {
    return !list.length ? 0 : Math.round(list.filter(v => v > line).length / list.length * 100);
  }
  function recLine(avg, lines) {
    return lines.reduce((b, l) => Math.abs(l - avg) < Math.abs(b - avg) ? l : b);
  }

  const cornerLines   = [7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
  const cardLines     = [1.5, 2.5, 3.5, 4.5, 5.5];
  const offsidesLines = [1.5, 2.5, 3.5, 4.5, 5.5];

  return {
    matches: count,
    corners: {
      avg: avgC,
      rec_line: recLine(avgC, cornerLines),
      lines: cornerLines.map(l => ({ line: l, over_pct: overPct(cL, l), under_pct: 100 - overPct(cL, l) })),
    },
    cards: {
      avg: avgY,
      avg_red: +(reds / count).toFixed(1),
      rec_line: recLine(avgY, cardLines),
      lines: cardLines.map(l => ({ line: l, over_pct: overPct(yL, l), under_pct: 100 - overPct(yL, l) })),
    },
    offsides: {
      avg: avgO,
      rec_line: recLine(avgO, offsidesLines),
      lines: offsidesLines.map(l => ({ line: l, over_pct: overPct(oL, l), under_pct: 100 - overPct(oL, l) })),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing event id' });

  try {
    // Phase 1 — fetch core data in parallel
    const [event, prediction, oddsData, lineups, h2h] = await Promise.all([
      safe(bsd(`/events/${id}/`)),
      safe(bsd(`/events/${id}/prediction/`)),
      safe(bsd(`/events/${id}/odds/comparison/`)),
      safe(bsd(`/events/${id}/lineups/`)),
      safe(bsd(`/events/${id}/h2h/`)),
    ]);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Phase 2 — fetch team fixtures in parallel
    const past90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const now    = new Date().toISOString();

    const [homeFixtures, awayFixtures] = await Promise.all([
      safe(bsd(`/teams/${event.home_team_id}/fixtures/`, { date_from: past90, date_to: now, status: 'finished', limit: 15 })),
      safe(bsd(`/teams/${event.away_team_id}/fixtures/`, { date_from: past90, date_to: now, status: 'finished', limit: 15 })),
    ]);

    const homeStats = calcStats(homeFixtures || [], event.home_team_id);
    const awayStats = calcStats(awayFixtures || [], event.away_team_id);

    // Phase 3 — historical stats for corners/cards
    const allFinishedIds = [
      ...(homeStats?.finishedIds || []),
      ...(awayStats?.finishedIds || []),
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 10);

    const histStats = await fetchHistoricalStats(allFinishedIds);

    // Extract odds
    const markets = oddsData?.markets || {};
    const odds = {
      home:     markets['1x2']?.HOME?.consensus?.decimal_odds || null,
      draw:     markets['1x2']?.DRAW?.consensus?.decimal_odds || null,
      away:     markets['1x2']?.AWAY?.consensus?.decimal_odds || null,
      over25:   markets['over_under_25']?.over?.consensus?.decimal_odds || null,
      under25:  markets['over_under_25']?.under?.consensus?.decimal_odds || null,
      over15:   markets['over_under_15']?.over?.consensus?.decimal_odds || null,
      btts_yes: markets['btts']?.yes?.consensus?.decimal_odds || null,
      btts_no:  markets['btts']?.no?.consensus?.decimal_odds || null,
    };

    const mc = prediction?.model?.confidence || 0.3;
    const sf = Math.min(homeStats?.sample_factor || 0.2, awayStats?.sample_factor || 0.2);
    const homeAdv = realHomeAdvantage(event);

    // Build models
    const poisson  = homeStats && awayStats ? buildPoisson(homeStats, awayStats, prediction, homeAdv, mc) : null;
    const ensemble = homeStats && awayStats && poisson ? ensembleProbs(poisson, prediction, homeStats, awayStats, mc, sf) : null;
    const bets     = homeStats && awayStats && poisson && ensemble ? calcValueBets(ensemble, poisson, prediction, odds, homeStats, awayStats, mc, sf) : [];
    const confidence = calcConfidence(homeStats, awayStats, lineups, prediction, event, poisson, ensemble);
    const trap       = calcTrap(homeStats, awayStats, lineups, prediction, event, h2h, ensemble);

    res.status(200).json({
      event,
      homeStats,
      awayStats,
      odds,
      prediction,
      h2h,
      lineups,
      histStats,
      poisson,
      ensemble,
      bets,
      meta: {
        confidence,
        trap: trap.score,
        trap_reasons: trap.reasons,
        home_advantage: homeAdv,
        model_confidence: mc,
        sample_factor: sf,
        lineup_status: lineups?.lineup_status || 'unavailable',
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
