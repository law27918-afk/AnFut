import { bsd, safe } from './_bsd.js';

// ─────────────────────────────────────────────────────────────
// STATS — separadas por contexto home/away
// ─────────────────────────────────────────────────────────────
function calcStats(fixtures, teamId) {
  const finished = (fixtures || []).filter(f =>
    f.status === 'finished' &&
    f.home_score !== null &&
    f.away_score !== null
  );

  // Contexto: todos, solo home, solo away
  const all   = finished.slice(0, 15);
  const home  = finished.filter(f => f.home_team_id === teamId).slice(0, 10);
  const away  = finished.filter(f => f.away_team_id === teamId).slice(0, 10);

  if (!all.length) return null;

  function agg(games, ctx) {
    if (!games.length) return null;
    let wins=0, draws=0, losses=0, gf=0, ga=0;
    let btts=0, o15=0, o25=0, o35=0, cs=0;
    let formPts = 0;

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
      form_pts_pct:    Math.round(formPts / (n * 3) * 100), // 0-100, mejor proxy que win%
      avg_gf:          +(gf / n).toFixed(2),
      avg_ga:          +(ga / n).toFixed(2),
      avg_total:       +((gf + ga) / n).toFixed(2),
      btts_pct:        Math.round(btts / n * 100),
      over15_pct:      Math.round(o15  / n * 100),
      over25_pct:      Math.round(o25  / n * 100),
      over35_pct:      Math.round(o35  / n * 100),
      clean_sheet_pct: Math.round(cs   / n * 100),
      // Wilson CI 95% para muestras pequeñas
      btts_ci:         wilsonCI(btts, n),
      over25_ci:       wilsonCI(o25,  n),
    };
  }

  const allStats  = agg(all,  'all');
  const homeStats = agg(home, 'home');
  const awayStats = agg(away, 'away');

  // sample_factor: 0-1, penaliza muestras pequeñas (óptimo con 15+)
  const sample_factor = Math.min(all.length / 15, 1);

  return {
    ...allStats,
    home_ctx: homeStats,
    away_ctx: awayStats,
    sample_factor,
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
  };
}

// ─────────────────────────────────────────────────────────────
// WILSON CONFIDENCE INTERVAL (95%)
// Devuelve [low, high] como porcentajes
// ─────────────────────────────────────────────────────────────
function wilsonCI(k, n) {
  if (!n) return [0, 100];
  const z = 1.96;
  const p = k / n;
  const denom = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / denom;
  const spread = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denom;
  return [
    Math.max(0,   Math.round((center - spread) * 100)),
    Math.min(100, Math.round((center + spread) * 100)),
  ];
}

// ─────────────────────────────────────────────────────────────
// LINEUP STRENGTH SCORE (avg ai_score titulares)
// ─────────────────────────────────────────────────────────────
function lineupStrength(lineups, side) {
  const players = lineups?.lineups?.[side]?.players || [];
  if (!players.length) return null;
  const scores = players.map(p => p.ai_score || 0).filter(s => s > 0);
  if (!scores.length) return null;
  return +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3);
}

// ─────────────────────────────────────────────────────────────
// PROBABILIDAD DINÁMICA
// Pondera ML vs forma según confianza del modelo y tamaño muestra
// ─────────────────────────────────────────────────────────────
function dynamicProb(prob_ml, prob_form, model_confidence, sample_factor) {
  // w_ml escala con confianza del modelo (max 0.70 si confianza=1.0)
  const w_ml   = Math.min(model_confidence * 0.70, 0.70);
  const w_form = 1 - w_ml;

  // Si muestra pequeña, diluir forma con prior neutro (33.3%)
  const PRIOR = 33.3;
  const prob_form_adj = (prob_form * sample_factor) + (PRIOR * (1 - sample_factor));

  return Math.round((prob_ml * w_ml) + (prob_form_adj * w_form));
}

// ─────────────────────────────────────────────────────────────
// CONFIDENCE SCORE (0-100)
// ─────────────────────────────────────────────────────────────
function calcConfidence(homeStats, awayStats, lineups, prediction, event) {
  let cs = 0;

  // Alineaciones (25 pts)
  const lstatus = lineups?.lineup_status;
  if (lstatus === 'confirmed') cs += 25;
  else if (lstatus === 'predicted') cs += 10;

  // Tamaño de muestra (20 pts)
  cs += Math.min((homeStats?.n || 0) / 15, 1) * 10;
  cs += Math.min((awayStats?.n || 0) / 15, 1) * 10;

  // Confianza del modelo ML (20 pts)
  const mc = prediction?.model?.confidence || 0;
  cs += mc * 20;

  // Separación de probabilidades (20 pts)
  const mr = prediction?.markets?.match_result || {};
  const probs = [mr.prob_home, mr.prob_draw, mr.prob_away].filter(p => p != null);
  if (probs.length === 3) {
    const spread = Math.max(...probs) - Math.min(...probs);
    cs += Math.min(spread / 30, 1) * 20;
  }

  // Consistencia ML vs forma (15 pts)
  if (homeStats && awayStats && probs.length === 3) {
    const ml_fav   = mr.prob_home > mr.prob_away ? 'home' : mr.prob_away > mr.prob_home ? 'away' : 'draw';
    const form_fav = homeStats.form_pts_pct > awayStats.form_pts_pct ? 'home' : 'away';
    if (ml_fav === form_fav) cs += 15;
  }

  // Penalizaciones
  if ((homeStats?.n || 0) < 5) cs -= 20;
  if ((awayStats?.n || 0) < 5) cs -= 20;
  if (event?.is_neutral_ground) cs -= 5;

  return Math.max(0, Math.min(100, Math.round(cs)));
}

// ─────────────────────────────────────────────────────────────
// TRAP SCORE (0-10)
// ─────────────────────────────────────────────────────────────
function calcTrap(homeStats, awayStats, lineups, prediction, event, h2h) {
  let ts = 0;

  const mc = prediction?.model?.confidence || 0;
  if (mc < 0.40) ts += 2;                                      // modelo inseguro

  const minN = Math.min(homeStats?.n || 0, awayStats?.n || 0);
  if (minN < 5)  ts += 2;                                      // muestra crítica
  else if (minN < 8) ts += 1;                                  // muestra pequeña

  const mr = prediction?.markets?.match_result || {};
  const spread = Math.abs((mr.prob_home || 0) - (mr.prob_away || 0));
  if (spread < 10) ts += 1;                                    // partido muy parejo

  if (lineups?.lineup_status !== 'confirmed') ts += 1;         // sin alineaciones

  if (event?.is_neutral_ground) ts += 1;                      // sin ventaja local

  if ((h2h?.total_matches || 0) < 3) ts += 1;                 // sin H2H

  // Bajas importantes (titulares lesionados)
  const unavH = lineups?.unavailable_players?.home?.length || 0;
  const unavA = lineups?.unavailable_players?.away?.length || 0;
  if (unavH >= 2 || unavA >= 2) ts += 1;                      // bajas importantes

  return Math.min(ts, 10);
}

// ─────────────────────────────────────────────────────────────
// EV ROBUSTO con descuento por incertidumbre
// ─────────────────────────────────────────────────────────────
function robustEV(prob_pct, odds, model_confidence, sample_factor) {
  if (!odds || !prob_pct) return null;
  const prob = prob_pct / 100;
  // Descuento por incertidumbre: a menor confianza y muestra, más conservador
  const uncertainty = 1 - (1 - model_confidence) * 0.4 * (1 - sample_factor);
  const prob_adj = prob * uncertainty;
  const ev  = +((prob_adj * odds) - 1).toFixed(3);
  const edge = +(prob_adj - (1 / odds)).toFixed(3);
  return { ev, edge, prob_adj: Math.round(prob_adj * 100) };
}

// ─────────────────────────────────────────────────────────────
// KELLY FRACCIONADO (30% Kelly)
// ─────────────────────────────────────────────────────────────
function kellyStake(edge, odds, bankroll) {
  if (!edge || !odds || edge <= 0) return null;
  const kelly = edge / (odds - 1);
  const frac  = kelly * 0.3; // Kelly fraccional conservador
  const pct   = Math.min(+(frac * 100).toFixed(2), 3); // máximo 3%
  return {
    pct,
    amount: bankroll ? Math.round(bankroll * pct / 100) : null,
  };
}

// ─────────────────────────────────────────────────────────────
// PASS AUTOMÁTICO
// ─────────────────────────────────────────────────────────────
function shouldPass(confidence, trap, edge, n_home, n_away, model_confidence, lineup_status) {
  const reasons = [];
  if (confidence < 60)              reasons.push(`Confianza insuficiente (${confidence}/100)`);
  if (trap >= 6)                    reasons.push(`Trap Score alto (${trap}/10)`);
  if (edge !== null && edge < 0.04) reasons.push(`Edge insuficiente (${(edge*100).toFixed(1)}% < 4%)`);
  if (n_home < 5)                   reasons.push(`Muestra local pequeña (${n_home} partidos)`);
  if (n_away < 5)                   reasons.push(`Muestra visitante pequeña (${n_away} partidos)`);
  if (model_confidence < 0.35 && lineup_status !== 'confirmed')
                                    reasons.push(`Modelo incierto sin alineaciones confirmadas`);
  return reasons;
}

// ─────────────────────────────────────────────────────────────
// GENERADOR DE APUESTAS
// ─────────────────────────────────────────────────────────────
function generateBets(homeStats, awayStats, odds, prediction, lineups, event, h2h) {
  const bets = [];
  if (!homeStats || !awayStats) return bets;

  const mc = prediction?.model?.confidence || 0.3;
  const sf_home = homeStats.sample_factor;
  const sf_away = awayStats.sample_factor;
  const sf = Math.min(sf_home, sf_away); // el más restrictivo

  // ── Usar contexto home/away si disponible, sino fallback a todos ──
  const hCtx = homeStats.home_ctx || homeStats; // stats del equipo jugando como local
  const aCtx = awayStats.away_ctx || awayStats; // stats del equipo jugando como visitante

  // ── BTTS ──
  // Combina: capacidad ofensiva del atacante + capacidad defensiva del defensor
  const btts_home = ((hCtx.btts_pct || homeStats.btts_pct) + (aCtx.btts_pct || awayStats.btts_pct)) / 2;
  const btts_ml   = prediction?.markets?.btts?.prob_yes || null;
  const btts_prob = btts_ml != null
    ? dynamicProb(btts_ml, btts_home, mc, sf)
    : Math.round(btts_home * sf + 50 * (1 - sf)); // sin ML, prior 50%

  const btts_ev = robustEV(btts_prob, odds?.btts_yes, mc, sf);
  const btts_pass = shouldPass(
    calcConfidence(homeStats, awayStats, lineups, prediction, event),
    calcTrap(homeStats, awayStats, lineups, prediction, event, h2h),
    btts_ev?.edge || null, homeStats.n, awayStats.n, mc, lineups?.lineup_status
  );

  bets.push({
    market: 'Ambos Marcan (BTTS Sí)',
    prob: btts_prob,
    ci: homeStats.btts_ci,
    odds: odds?.btts_yes || null,
    ev: btts_ev?.ev ?? null,
    edge: btts_ev?.edge ?? null,
    reason: `Local BTTS ${hCtx.btts_pct ?? homeStats.btts_pct}% | Visitante BTTS ${aCtx.btts_pct ?? awayStats.btts_pct}% | ML: ${btts_ml != null ? btts_ml.toFixed(1)+'%' : 'N/D'}`,
    recommend: btts_prob >= 55 && !btts_pass.length,
    pass_reasons: btts_pass,
    verdict: btts_pass.length ? 'PASS' : btts_prob >= 60 ? 'BET' : btts_prob >= 50 ? 'LEAN' : 'PASS',
  });

  // ── Over 2.5 ──
  const o25_home = hCtx.over25_pct ?? homeStats.over25_pct;
  const o25_away = aCtx.over25_pct ?? awayStats.over25_pct;
  const o25_form = (o25_home + o25_away) / 2;
  const o25_ml   = prediction?.markets?.over_under?.prob_over_25 || null;
  const o25_prob = o25_ml != null
    ? dynamicProb(o25_ml, o25_form, mc, sf)
    : Math.round(o25_form * sf + 40 * (1 - sf)); // prior 40%

  const o25_ev   = robustEV(o25_prob, odds?.over25, mc, sf);
  bets.push({
    market: 'Over 2.5 Goles',
    prob: o25_prob,
    ci: homeStats.over25_ci,
    odds: odds?.over25 || null,
    ev: o25_ev?.ev ?? null,
    edge: o25_ev?.edge ?? null,
    reason: `Local O2.5 ${o25_home}% | Visitante O2.5 ${o25_away}% | xG combinado: ${((prediction?.markets?.expected_goals?.home||0)+(prediction?.markets?.expected_goals?.away||0)).toFixed(2)} | ML: ${o25_ml != null ? o25_ml.toFixed(1)+'%' : 'N/D'}`,
    recommend: o25_prob >= 55 && (o25_ev?.edge || 0) >= 0.04,
    verdict: o25_prob >= 60 && (o25_ev?.edge || 0) >= 0.04 ? 'BET' : o25_prob >= 50 ? 'LEAN' : 'PASS',
  });

  // ── Over 1.5 ──
  const o15_form = ((hCtx.over15_pct ?? homeStats.over15_pct) + (aCtx.over15_pct ?? awayStats.over15_pct)) / 2;
  const o15_ml   = prediction?.markets?.over_under?.prob_over_15 || null;
  const o15_prob = o15_ml != null
    ? dynamicProb(o15_ml, o15_form, mc, sf)
    : Math.round(o15_form * sf + 65 * (1 - sf)); // prior 65%
  const o15_ev = robustEV(o15_prob, odds?.over15, mc, sf);
  bets.push({
    market: 'Over 1.5 Goles',
    prob: o15_prob,
    ci: null,
    odds: odds?.over15 || null,
    ev: o15_ev?.ev ?? null,
    edge: o15_ev?.edge ?? null,
    reason: `Over 1.5 en ${Math.round(o15_form)}% de partidos recientes. ML: ${o15_ml != null ? o15_ml.toFixed(1)+'%' : 'N/D'}`,
    recommend: o15_prob >= 70 && (o15_ev?.edge || 0) >= 0.04,
    verdict: o15_prob >= 75 ? 'BET' : o15_prob >= 65 ? 'LEAN' : 'PASS',
  });

  // ── 1X2 ──
  const mr = prediction?.markets?.match_result || {};
  const hML = mr.prob_home, dML = mr.prob_draw, aML = mr.prob_away;

  if (hML != null) {
    // Forma ajustada: usar contexto específico home/away
    const hForm = hCtx.win_pct  ?? homeStats.win_pct;
    const aForm = aCtx.win_pct  ?? awayStats.win_pct;
    const dForm = ((hCtx.draw_pct ?? homeStats.draw_pct) + (aCtx.draw_pct ?? awayStats.draw_pct)) / 2;

    const hProb = dynamicProb(hML, hForm, mc, sf_home);
    const aProb = dynamicProb(aML, aForm, mc, sf_away);
    const dProb = dynamicProb(dML, dForm, mc, sf);

    // Normalizar para que sumen 100%
    const total = hProb + aProb + dProb;
    const hNorm = Math.round(hProb / total * 100);
    const aNorm = Math.round(aProb / total * 100);
    const dNorm = 100 - hNorm - aNorm;

    const hEV = robustEV(hNorm, odds?.home, mc, sf_home);
    const aEV = robustEV(aNorm, odds?.away, mc, sf_away);
    const dEV = robustEV(dNorm, odds?.draw, mc, sf);

    // Lineup strength como factor adicional
    const lsHome = lineupStrength(lineups, 'home');
    const lsAway = lineupStrength(lineups, 'away');
    const lsNote = lsHome && lsAway
      ? ` | Fuerza XI: Local ${(lsHome*100).toFixed(0)} vs Visitante ${(lsAway*100).toFixed(0)}`
      : '';

    bets.push({
      market: 'Victoria Local',
      prob: hNorm,
      ci: null,
      odds: odds?.home || null,
      ev: hEV?.ev ?? null,
      edge: hEV?.edge ?? null,
      reason: `ML ${Math.round(hML)}% | Forma local ${hForm}% victorias${lsNote}`,
      recommend: hNorm >= 50 && hNorm > aNorm + 10 && (hEV?.edge || 0) >= 0.04,
      verdict: hNorm >= 55 && (hEV?.edge || 0) >= 0.04 ? 'BET' : hNorm >= 45 ? 'LEAN' : 'PASS',
    });

    bets.push({
      market: 'Empate',
      prob: dNorm,
      ci: null,
      odds: odds?.draw || null,
      ev: dEV?.ev ?? null,
      edge: dEV?.edge ?? null,
      reason: `ML ${Math.round(dML)}% | Local empata ${hCtx.draw_pct ?? homeStats.draw_pct}% | Visitante empata ${aCtx.draw_pct ?? awayStats.draw_pct}%`,
      recommend: dNorm >= 32 && (dEV?.edge || 0) >= 0.04 && homeStats.draw_pct >= 25 && awayStats.draw_pct >= 25,
      verdict: dNorm >= 35 && (dEV?.edge || 0) >= 0.04 ? 'BET' : dNorm >= 28 ? 'LEAN' : 'PASS',
    });

    bets.push({
      market: 'Victoria Visitante',
      prob: aNorm,
      ci: null,
      odds: odds?.away || null,
      ev: aEV?.ev ?? null,
      edge: aEV?.edge ?? null,
      reason: `ML ${Math.round(aML)}% | Forma visitante ${aForm}% victorias${lsNote}`,
      recommend: aNorm >= 50 && aNorm > hNorm + 10 && (aEV?.edge || 0) >= 0.04,
      verdict: aNorm >= 55 && (aEV?.edge || 0) >= 0.04 ? 'BET' : aNorm >= 45 ? 'LEAN' : 'PASS',
    });
  }

  return bets.sort((a, b) => b.prob - a.prob);
}

// ─────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing event id' });

  try {
    const [event, prediction, oddsData] = await Promise.all([
      safe(bsd(`/events/${id}/`)),
      safe(bsd(`/events/${id}/prediction/`)),
      safe(bsd(`/events/${id}/odds/comparison/`)),
    ]);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const past90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const now    = new Date().toISOString();

    // 15 partidos para mayor significancia estadística
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

    const bets = generateBets(homeStats, awayStats, odds, prediction, lineups, event, h2h);

    // Kelly sizing si hay bankroll en query
    const bankroll = req.query.bankroll ? parseFloat(req.query.bankroll) : null;
    bets.forEach(b => {
      if (b.edge != null && b.odds) {
        b.kelly = kellyStake(b.edge, b.odds, bankroll);
      }
    });

    res.status(200).json({
      event,
      homeStats,
      awayStats,
      odds,
      prediction,
      h2h,
      lineups,
      bets,
      meta: {
        confidence,
        trap,
        model_confidence: mc,
        sample_factor: sf,
        lineup_status: lineups?.lineup_status || 'unavailable',
        // Resumen de señales de PASS globales
        global_pass: confidence < 60 || trap >= 6,
        global_pass_reasons: [
          confidence < 60 ? `Confianza ${confidence}/100 < 60` : null,
          trap >= 6       ? `Trap Score ${trap}/10 >= 6`       : null,
        ].filter(Boolean),
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
