import { bsd, safe } from './_bsd.js';

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN — Competiciones siempre neutrales (Mundial, etc.)
// ═══════════════════════════════════════════════════════════
const NEUTRAL_COMPETITIONS = [
  // Ejemplo: ID de la FIFA World Cup. Cambia según tu API.
  1,
  // Añade aquí otros IDs de torneos en sede neutral (Eurocopa, Copa América, etc.)
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** ¿El partido se juega en cancha neutral? (por indicador o por torneo) */
function isNeutralVenue(event) {
  if (!event) return false;
  if (event.is_neutral_ground) return true;
  if (event.league_id && NEUTRAL_COMPETITIONS.includes(event.league_id)) return true;
  return false;
}

/** Intervalo de confianza Wilson al 95%. Retorna [min%, max%] o null si n=0 */
function wilsonCI(k, n) {
  if (!n) return null;
  const z = 1.96, p = k / n;
  const d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d;
  const s = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return [Math.max(0, Math.round((c - s) * 100)), Math.min(100, Math.round((c + s) * 100))];
}

/** Línea recomendada: la línea estándar más cercana al promedio */
function recLine(avg, lines) {
  if (!lines || !lines.length) return null;
  return lines.reduce((best, l) =>
    Math.abs(l - avg) < Math.abs(best - avg) ? l : best
  , lines[0]);
}

// ─────────────────────────────────────────────────────────────
// STATS DE RESULTADOS — separadas por contexto home/away
// ─────────────────────────────────────────────────────────────
function calcStats(fixtures, teamId) {
  const finished = (fixtures || [])
    .filter(f => f.status === 'finished' && f.home_score !== null && f.away_score !== null)
    // Ordenar por fecha descendente (más reciente primero)
    .sort((a, b) => (b.event_date || '').localeCompare(a.event_date || ''));

  const all  = finished.slice(0, 15);
  const home = finished.filter(f => f.home_team_id === teamId).slice(0, 10);
  const away = finished.filter(f => f.away_team_id === teamId).slice(0, 10);

  if (!all.length) return null;

  function agg(games) {
    if (!games.length) return null;
    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    let btts = 0, o15 = 0, o25 = 0, o35 = 0, cs = 0, formPts = 0;
    games.forEach(f => {
      const isH = f.home_team_id === teamId;
      const scored  = isH ? f.home_score : f.away_score;
      const concede = isH ? f.away_score : f.home_score;
      const total   = scored + concede;
      gf += scored; ga += concede;
      if (scored > concede) { wins++; formPts += 3; }
      else if (scored === concede) { draws++; formPts += 1; }
      else losses++;
      if (scored > 0 && concede > 0) btts++;
      if (total > 1) o15++;
      if (total > 2) o25++;
      if (total > 3) o35++;
      if (concede === 0) cs++;
    });
    const n = games.length;
    return {
      n,
      wins, draws, losses,
      win_pct:         Math.round(wins  / n * 100),
      draw_pct:        Math.round(draws / n * 100),
      loss_pct:        Math.round(losses/ n * 100),
      form_pts_pct:    Math.round(formPts / (n * 3) * 100),
      avg_gf:          +(gf / n).toFixed(2),
      avg_ga:          +(ga / n).toFixed(2),
      avg_total:       +((gf + ga) / n).toFixed(2),
      btts_pct:        Math.round(btts / n * 100),
      over15_pct:      Math.round(o15  / n * 100),
      over25_pct:      Math.round(o25  / n * 100),
      over35_pct:      Math.round(o35  / n * 100),
      clean_sheet_pct: Math.round(cs   / n * 100),
      btts_ci:         wilsonCI(btts, n),
      over25_ci:       wilsonCI(o25, n),
    };
  }

  return {
    ...agg(all),
    home_ctx: agg(home),
    away_ctx: agg(away),
    sample_factor: Math.min(all.length / 15, 1),
    form: all.slice(0, 6).map(f => {
      const isH = f.home_team_id === teamId;
      const s = isH ? f.home_score : f.away_score;
      const c = isH ? f.away_score : f.home_score;
      return s > c ? 'W' : s < c ? 'L' : 'D';
    }),
    recent: all.slice(0, 6).map(f => {
      const isH = f.home_team_id === teamId;
      return {
        opponent: isH ? f.away_team : f.home_team,
        home: isH,
        gf: isH ? f.home_score : f.away_score,
        ga: isH ? f.away_score : f.home_score,
        date: f.event_date?.split('T')[0],
      };
    }),
    finishedIds: finished.slice(0, 6).map(f => f.id),
  };
}

// ─────────────────────────────────────────────────────────────
// STATS HISTÓRICAS (corners, tarjetas, offsides)
// ─────────────────────────────────────────────────────────────
async function fetchHistoricalStats(eventIds, teamId) {
  if (!eventIds?.length) return null;

  const results = await Promise.all(
    eventIds.map(id => safe(bsd(`/events/${id}/stats/`)))
  );

  let corners = 0, yellows = 0, reds = 0, offsides = 0, count = 0;
  let cornersList = [], yellowsList = [], offsidessList = [];

  results.forEach(stats => {
    if (!stats) return;
    const home = stats.stats?.home || stats.home || {};
    const away = stats.stats?.away || stats.away || {};

    // Contamos todos los partidos que devuelven datos, aunque los valores sean 0
    // (sólo ignoramos respuestas completamente vacías)
    if (Object.keys(home).length === 0 && Object.keys(away).length === 0) return;

    const totalCorners  = (home.corner_kicks || 0) + (away.corner_kicks || 0);
    const totalYellows  = (home.yellow_cards || 0) + (away.yellow_cards || 0);
    const totalReds     = (home.red_cards    || 0) + (away.red_cards    || 0);
    const totalOffsides = (home.offsides     || 0) + (away.offsides     || 0);

    corners  += totalCorners;
    yellows  += totalYellows;
    reds     += totalReds;
    offsides += totalOffsides;
    count++;

    cornersList.push(totalCorners);
    yellowsList.push(totalYellows);
    offsidessList.push(totalOffsides);
  });

  if (!count) return null;

  const avgCorners  = +(corners  / count).toFixed(1);
  const avgYellows  = +(yellows  / count).toFixed(1);
  const avgOffsides = +(offsides / count).toFixed(1);

  function overPct(list, line) {
    if (!list.length) return 0;
    return Math.round(list.filter(v => v > line).length / list.length * 100);
  }

  const cornerLines   = [7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
  const cardLines     = [1.5, 2.5, 3.5, 4.5, 5.5];
  const offsidesLines = [1.5, 2.5, 3.5, 4.5, 5.5];

  return {
    matches: count,
    corners: {
      avg: avgCorners,
      rec_line: recLine(avgCorners, cornerLines),
      lines: cornerLines.map(l => ({
        line: l,
        over_pct: overPct(cornersList, l),
        under_pct: 100 - overPct(cornersList, l),
      })),
    },
    cards: {
      avg: avgYellows,
      avg_red: +(reds / count).toFixed(1),
      rec_line: recLine(avgYellows, cardLines),
      lines: cardLines.map(l => ({
        line: l,
        over_pct: overPct(yellowsList, l),
        under_pct: 100 - overPct(yellowsList, l),
      })),
    },
    offsides: {
      avg: avgOffsides,
      rec_line: recLine(avgOffsides, offsidesLines),
      lines: offsidesLines.map(l => ({
        line: l,
        over_pct: overPct(offsidessList, l),
        under_pct: 100 - overPct(offsidessList, l),
      })),
    },
  };
}

// ─────────────────────────────────────────────────────────────
// LINEUP STRENGTH SCORE
// ─────────────────────────────────────────────────────────────
function lineupStrength(lineups, side) {
  const players = lineups?.lineups?.[side]?.players || [];
  if (!players.length) return null;
  const scores = players.map(p => p.ai_score || 0).filter(s => s > 0);
  if (!scores.length) return null;
  return +(scores.reduce((a, b) => a + b, 0) / scores.length * 100).toFixed(0);
}

// ─────────────────────────────────────────────────────────────
// PROBABILIDAD DINÁMICA
// ─────────────────────────────────────────────────────────────
function dynamicProb(prob_ml, prob_form, model_confidence, sample_factor) {
  const w_ml   = Math.min(model_confidence * 0.70, 0.70);
  const w_form = 1 - w_ml;
  const PRIOR  = 33.3;
  const prob_form_adj = (prob_form * sample_factor) + (PRIOR * (1 - sample_factor));
  return Math.round((prob_ml * w_ml) + (prob_form_adj * w_form));
}

// ─────────────────────────────────────────────────────────────
// CONFIDENCE SCORE
// ─────────────────────────────────────────────────────────────
function calcConfidence(homeStats, awayStats, lineups, prediction, event) {
  let cs = 0;
  const lstatus = lineups?.lineup_status;
  if (lstatus === 'confirmed') cs += 25;
  else if (lstatus === 'predicted') cs += 10;
  cs += Math.min((homeStats?.n || 0) / 15, 1) * 10;
  cs += Math.min((awayStats?.n || 0) / 15, 1) * 10;
  const mc = prediction?.model?.confidence || 0;
  cs += mc * 20;
  const mr = prediction?.markets?.match_result || {};
  const probs = [mr.prob_home, mr.prob_draw, mr.prob_away].filter(p => p != null);
  if (probs.length === 3) {
    const spread = Math.max(...probs) - Math.min(...probs);
    cs += Math.min(spread / 30, 1) * 20;
  }
  if (homeStats && awayStats && probs.length === 3) {
    const ml_fav   = mr.prob_home > mr.prob_away ? 'home' : 'away';
    const form_fav = homeStats.form_pts_pct > awayStats.form_pts_pct ? 'home' : 'away';
    if (ml_fav === form_fav) cs += 15;
  }
  if ((homeStats?.n || 0) < 5) cs -= 20;
  if ((awayStats?.n || 0) < 5) cs -= 20;
  if (event?.is_neutral_ground) cs -= 5;
  return Math.max(0, Math.min(100, Math.round(cs)));
}

// ─────────────────────────────────────────────────────────────
// TRAP SCORE
// ─────────────────────────────────────────────────────────────
function calcTrap(homeStats, awayStats, lineups, prediction, event, h2h) {
  let ts = 0;
  const mc = prediction?.model?.confidence || 0;
  if (mc < 0.40) ts += 2;
  const minN = Math.min(homeStats?.n || 0, awayStats?.n || 0);
  if (minN < 5) ts += 2;
  else if (minN < 8) ts += 1;
  const mr = prediction?.markets?.match_result || {};
  if (Math.abs((mr.prob_home || 0) - (mr.prob_away || 0)) < 10) ts += 1;
  if (lineups?.lineup_status !== 'confirmed') ts += 1;
  if (event?.is_neutral_ground) ts += 1;
  if ((h2h?.total_matches || 0) < 3) ts += 1;
  const unavH = lineups?.unavailable_players?.home?.length || 0;
  const unavA = lineups?.unavailable_players?.away?.length || 0;
  if (unavH >= 2 || unavA >= 2) ts += 1;
  return Math.min(ts, 10);
}

// ─────────────────────────────────────────────────────────────
// EV ROBUSTO
// ─────────────────────────────────────────────────────────────
function robustEV(prob_pct, odds, model_confidence, sample_factor) {
  if (!odds || !prob_pct) return null;
  const prob = prob_pct / 100;
  const uncertainty = 1 - (1 - model_confidence) * 0.4 * (1 - sample_factor);
  const prob_adj = prob * uncertainty;
  return {
    ev:       +((prob_adj * odds) - 1).toFixed(3),
    edge:     +(prob_adj - (1 / odds)).toFixed(3),
    prob_adj: Math.round(prob_adj * 100),
  };
}

// ─────────────────────────────────────────────────────────────
// GENERADOR DE APUESTAS (resultado + goles)
// ─────────────────────────────────────────────────────────────
function generateBets(homeStats, awayStats, odds, prediction, lineups, event, h2h) {
  const bets = [];
  if (!homeStats || !awayStats) return bets;

  const mc  = prediction?.model?.confidence || 0.3;
  const sf  = Math.min(homeStats.sample_factor, awayStats.sample_factor);
  const sfH = homeStats.sample_factor;
  const sfA = awayStats.sample_factor;

  // ═══ DETERMINAR SI ES CANCHA NEUTRAL ═══
  const isNeutral = isNeutralVenue(event);
  const hCtx = isNeutral ? homeStats : (homeStats.home_ctx || homeStats);
  const aCtx = isNeutral ? awayStats : (awayStats.away_ctx || awayStats);

  // ── BTTS ──
  const btts_form = ((hCtx.btts_pct ?? homeStats.btts_pct) + (aCtx.btts_pct ?? awayStats.btts_pct)) / 2;
  const btts_ml   = prediction?.markets?.btts?.prob_yes ?? null;
  const btts_prob = btts_ml != null
    ? dynamicProb(btts_ml, btts_form, mc, sf)
    : Math.round(btts_form * sf + 50 * (1 - sf));
  const btts_ev = robustEV(btts_prob, odds?.btts_yes, mc, sf);
  bets.push({
    market: 'Ambos marcan (BTTS)',
    prob: btts_prob,
    ci: homeStats.btts_ci,
    odds: odds?.btts_yes || null,
    ev: btts_ev?.ev ?? null,
    edge: btts_ev?.edge ?? null,
    reason: `${event.home_team} BTTS ${hCtx.btts_pct ?? homeStats.btts_pct}% | ${event.away_team} BTTS ${aCtx.btts_pct ?? awayStats.btts_pct}% | ML: ${btts_ml != null ? btts_ml.toFixed(1)+'%' : 'N/D'}`,
  });

  // ── Over/Under goles ──
  const o25_home = hCtx.over25_pct ?? homeStats.over25_pct;
  const o25_away = aCtx.over25_pct ?? awayStats.over25_pct;
  const o25_ml   = prediction?.markets?.over_under?.prob_over_25 ?? null;
  const o25_prob = o25_ml != null
    ? dynamicProb(o25_ml, (o25_home + o25_away) / 2, mc, sf)
    : Math.round((o25_home + o25_away) / 2 * sf + 40 * (1 - sf));

  const o15_home = hCtx.over15_pct ?? homeStats.over15_pct;
  const o15_away = aCtx.over15_pct ?? awayStats.over15_pct;
  const o15_ml   = prediction?.markets?.over_under?.prob_over_15 ?? null;
  const o15_prob = o15_ml != null
    ? dynamicProb(o15_ml, (o15_home + o15_away) / 2, mc, sf)
    : Math.round((o15_home + o15_away) / 2 * sf + 65 * (1 - sf));

  const o35_home = hCtx.over35_pct ?? homeStats.over35_pct;
  const o35_away = aCtx.over35_pct ?? awayStats.over35_pct;
  const o35_ml   = prediction?.markets?.over_under?.prob_over_35 ?? null;
  const o35_prob = o35_ml != null
    ? dynamicProb(o35_ml, (o35_home + o35_away) / 2, mc, sf)
    : Math.round((o35_home + o35_away) / 2 * sf + 25 * (1 - sf));

  const xgTotal = (prediction?.markets?.expected_goals?.home || 0) + (prediction?.markets?.expected_goals?.away || 0);
  const avgGoals = ((homeStats.avg_total || homeStats.avg_total_goals || 0) + (awayStats.avg_total || awayStats.avg_total_goals || 0)) / 2;
  const recGoalLine = xgTotal > 0
    ? (xgTotal > 3 ? 'Over 2.5' : xgTotal > 2 ? 'Over 1.5' : 'Under 1.5')
    : (avgGoals > 3 ? 'Over 2.5' : avgGoals > 2 ? 'Over 1.5' : 'Under 1.5');

  bets.push({
    market: 'Goles',
    isGoals: true,
    lines: [
      { label: 'Over 1.5', prob: o15_prob, odds: odds?.over15 || null, ev: robustEV(o15_prob, odds?.over15, mc, sf)?.ev ?? null },
      { label: 'Over 2.5', prob: o25_prob, odds: odds?.over25 || null, ev: robustEV(o25_prob, odds?.over25, mc, sf)?.ev ?? null },
      { label: 'Over 3.5', prob: o35_prob, odds: null, ev: null },
      { label: 'BTTS',     prob: btts_prob, odds: odds?.btts_yes || null, ev: btts_ev?.ev ?? null },
    ],
    rec_line: recGoalLine,
    xg_home: prediction?.markets?.expected_goals?.home,
    xg_away: prediction?.markets?.expected_goals?.away,
    avg_goals: +avgGoals.toFixed(1),
    reason: `xG combinado: ${xgTotal.toFixed(2)} | Promedio histórico: ${avgGoals.toFixed(1)} goles/partido`,
  });

  // ── 1X2 ──
  const mr  = prediction?.markets?.match_result || {};
  const hML = mr.prob_home, dML = mr.prob_draw, aML = mr.prob_away;

  if (hML != null) {
    const hForm = hCtx.win_pct  ?? homeStats.win_pct;
    const aForm = aCtx.win_pct  ?? awayStats.win_pct;
    const dForm = ((hCtx.draw_pct ?? homeStats.draw_pct) + (aCtx.draw_pct ?? awayStats.draw_pct)) / 2;

    const hProb = dynamicProb(hML, hForm, mc, sfH);
    const aProb = dynamicProb(aML, aForm, mc, sfA);
    const dProb = dynamicProb(dML, dForm, mc, sf);
    const total = hProb + aProb + dProb;
    const hNorm = Math.round(hProb / total * 100);
    const aNorm = Math.round(aProb / total * 100);
    const dNorm = 100 - hNorm - aNorm;

    const lsHome = lineupStrength(lineups, 'home');
    const lsAway = lineupStrength(lineups, 'away');

    bets.push({
      market: 'Resultado',
      isResult: true,
      home_name: event.home_team,
      away_name: event.away_team,
      home_prob: hNorm,
      draw_prob: dNorm,
      away_prob: aNorm,
      home_odds: odds?.home || null,
      draw_odds: odds?.draw || null,
      away_odds: odds?.away || null,
      home_ev: robustEV(hNorm, odds?.home, mc, sfH)?.ev ?? null,
      draw_ev: robustEV(dNorm, odds?.draw, mc, sf)?.ev   ?? null,
      away_ev: robustEV(aNorm, odds?.away, mc, sfA)?.ev  ?? null,
      home_form: hForm,
      away_form: aForm,
      lineup_home: lsHome,
      lineup_away: lsAway,
      home_stats: {
        win_pct:         hCtx.win_pct         ?? homeStats.win_pct,
        draw_pct:        hCtx.draw_pct        ?? homeStats.draw_pct,
        avg_gf:          hCtx.avg_gf          ?? homeStats.avg_goals_for,
        clean_sheet_pct: hCtx.clean_sheet_pct ?? homeStats.clean_sheet_pct,
      },
      away_stats: {
        win_pct:         aCtx.win_pct         ?? awayStats.win_pct,
        draw_pct:        aCtx.draw_pct        ?? awayStats.draw_pct,
        avg_gf:          aCtx.avg_gf          ?? awayStats.avg_goals_for,
        clean_sheet_pct: aCtx.clean_sheet_pct ?? awayStats.clean_sheet_pct,
      },
    });
  }

  return bets;
}

// ─────────────────────────────────────────────────────────────
// COMBINA STATS HISTÓRICAS DE AMBOS EQUIPOS
// ─────────────────────────────────────────────────────────────
function combineHistStats(homeHist, awayHist) {
  if (!homeHist && !awayHist) return null;
  const h = homeHist || awayHist;
  const a = awayHist || homeHist;

  function avgLines(linesH, linesA) {
    if (!linesH || !linesA) return linesH || linesA;
    return linesH.map((lh, i) => ({
      line: lh.line,
      over_pct:  Math.round((lh.over_pct  + (linesA[i]?.over_pct  || lh.over_pct))  / 2),
      under_pct: Math.round((lh.under_pct + (linesA[i]?.under_pct || lh.under_pct)) / 2),
    }));
  }

  const avgCorners  = +((h.corners.avg  + a.corners.avg)  / 2).toFixed(1);
  const avgCards    = +((h.cards.avg    + a.cards.avg)    / 2).toFixed(1);
  const avgOffsides = +((h.offsides.avg + a.offsides.avg) / 2).toFixed(1);

  const combinedCornerLines   = avgLines(h.corners.lines,  a.corners.lines);
  const combinedCardLines     = avgLines(h.cards.lines,    a.cards.lines);
  const combinedOffsidesLines = avgLines(h.offsides.lines, a.offsides.lines);

  return {
    matches: Math.round((h.matches + a.matches) / 2),
    corners: {
      avg: avgCorners,
      rec_line: recLine(avgCorners, combinedCornerLines),
      lines: combinedCornerLines,
    },
    cards: {
      avg: avgCards,
      rec_line: recLine(avgCards, combinedCardLines),
      lines: combinedCardLines,
    },
    offsides: {
      avg: avgOffsides,
      rec_line: recLine(avgOffsides, combinedOffsidesLines),
      lines: combinedOffsidesLines,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing event id' });

  try {
    // Ronda 1 — datos del evento
    const [event, prediction, oddsData] = await Promise.all([
      safe(bsd(`/events/${id}/`)),
      safe(bsd(`/events/${id}/prediction/`)),
      safe(bsd(`/events/${id}/odds/comparison/`)),
    ]);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const past90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const now    = new Date().toISOString();

    // Ronda 2 — fixtures + lineups + H2H en paralelo
    const [homeFixtures, awayFixtures, h2h, lineups] = await Promise.all([
      safe(bsd(`/teams/${event.home_team_id}/fixtures/`, {
        date_from: past90, date_to: now, status: 'finished', limit: 15
      })),
      safe(bsd(`/teams/${event.away_team_id}/fixtures/`, {
        date_from: past90, date_to: now, status: 'finished', limit: 15
      })),
      safe(bsd(`/events/${id}/h2h/`)),
      safe(bsd(`/events/${id}/lineups/`)),
    ]);

    const homeStats = calcStats(homeFixtures || [], event.home_team_id);
    const awayStats = calcStats(awayFixtures || [], event.away_team_id);

    // Ronda 3 — stats históricas en paralelo
    const homeIds = homeStats?.finishedIds || [];
    const awayIds = awayStats?.finishedIds || [];
    const allIds = [...new Set([...homeIds, ...awayIds])];

    const [homeHistStats, awayHistStats] = await Promise.all([
      fetchHistoricalStats(homeIds, event.home_team_id),
      fetchHistoricalStats(awayIds, event.away_team_id),
    ]);

    const matchHistStats = combineHistStats(homeHistStats, awayHistStats);

    // Extrae cuotas
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

    const confidence = calcConfidence(homeStats, awayStats, lineups, prediction, event);
    const trap       = calcTrap(homeStats, awayStats, lineups, prediction, event, h2h);
    const mc         = prediction?.model?.confidence || 0;
    const sf         = Math.min(homeStats?.sample_factor || 0, awayStats?.sample_factor || 0);
    const bets       = generateBets(homeStats, awayStats, odds, prediction, lineups, event, h2h);

    res.status(200).json({
      event,
      homeStats,
      awayStats,
      odds,
      prediction,
      h2h,
      lineups,
      bets,
      histStats: matchHistStats,
      homeHistStats,
      awayHistStats,
      meta: {
        confidence,
        trap,
        model_confidence: mc,
        sample_factor: sf,
        lineup_status: lineups?.lineup_status || 'unavailable',
        is_neutral_ground: isNeutralVenue(event), // indicador útil para el cliente
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
