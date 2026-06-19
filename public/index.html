<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scout — Datos de Partido</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@600;700&display=swap');

:root {
  --bg:       #0b0d11;
  --s1:       #13161c;
  --s2:       #1a1e27;
  --s3:       #21263200;
  --bd:       rgba(255,255,255,.07);
  --bds:      rgba(255,255,255,.13);
  --t:        #dde1eb;
  --tm:       #6b7491;
  --td:       #3a3f55;
  --green:    #4ade80;
  --yellow:   #fbbf24;
  --red:      #f87171;
  --blue:     #60a5fa;
  --purple:   #a78bfa;
  --r:        10px;
  --rl:       14px;
}

*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--t);font-family:'Inter',sans-serif;font-size:14px;line-height:1.55;min-height:100vh}

/* ── layout ── */
.shell{max-width:860px;margin:0 auto;padding:2rem 1.25rem 5rem}

/* ── header ── */
.hdr{border-bottom:.5px solid var(--bd);padding-bottom:1.5rem;margin-bottom:2rem}
.hdr-eye{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin-bottom:6px}
.hdr h1{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:-.02em}
.hdr p{color:var(--tm);font-size:13px;margin-top:4px}

/* ── search box ── */
.search-wrap{display:flex;gap:8px;margin-bottom:1rem}
.search-wrap input{flex:1;background:var(--s1);border:.5px solid var(--bds);border-radius:var(--r);padding:10px 14px;color:var(--t);font-family:inherit;font-size:14px;outline:none;transition:border-color .15s}
.search-wrap input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(74,222,128,.07)}
.btn{background:var(--s1);border:.5px solid var(--bds);border-radius:var(--r);padding:10px 18px;color:var(--t);font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s}
.btn:hover{background:var(--s2)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-green{background:var(--green);color:#050a06;border-color:var(--green)}
.btn-green:hover{background:#3dc970}

/* ── event list ── */
.event-list{display:flex;flex-direction:column;gap:6px;margin-bottom:1.5rem}
.event-row{background:var(--s1);border:.5px solid var(--bd);border-radius:var(--r);padding:.75rem 1rem;cursor:pointer;display:flex;align-items:center;gap:10px;transition:border-color .15s,background .15s}
.event-row:hover{background:var(--s2);border-color:var(--bds)}
.event-row.active{border-color:var(--green);background:rgba(74,222,128,.05)}
.er-teams{flex:1;font-weight:500;color:#fff;font-size:13px}
.er-teams span{color:var(--tm);font-weight:400}
.er-meta{font-size:11px;color:var(--td);text-align:right;line-height:1.4}
.er-league{font-size:11px;color:var(--purple)}

/* ── tabs ── */
.tabs{display:flex;gap:4px;margin-bottom:1rem;flex-wrap:wrap}
.tab{padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:.5px solid transparent;color:var(--tm);transition:all .15s}
.tab:hover{color:var(--t);background:var(--s2)}
.tab.active{background:var(--s2);border-color:var(--bds);color:var(--t)}

/* ── section card ── */
.sec{background:var(--s1);border:.5px solid var(--bd);border-radius:var(--rl);padding:1.25rem 1.5rem;margin-bottom:.875rem}
.sec-title{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--td);font-weight:500;margin-bottom:1rem}

/* ── scoreboard ── */
.scoreboard{display:flex;align-items:center;justify-content:center;gap:1.5rem;padding:.5rem 0 1rem}
.sb-team{text-align:center;flex:1}
.sb-team-name{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:4px}
.sb-team-sub{font-size:11px;color:var(--tm)}
.sb-score{font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:700;color:#fff;min-width:80px;text-align:center;letter-spacing:-.02em}
.sb-vs{font-size:13px;color:var(--td)}
.status-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
.status-live{background:rgba(248,113,113,.15);color:var(--red)}
.status-ns{background:rgba(96,165,250,.1);color:var(--blue)}
.status-fin{background:rgba(74,222,128,.1);color:var(--green)}

/* ── 2-col grid ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
@media(max-width:560px){.g2{grid-template-columns:1fr}}

/* ── stat rows ── */
.stat-bar-row{margin-bottom:.875rem}
.stat-bar-labels{display:flex;justify-content:space-between;font-size:12px;color:var(--tm);margin-bottom:4px}
.stat-bar-labels .name{color:var(--t);font-weight:500}
.stat-bar-track{height:4px;background:var(--s2);border-radius:99px;overflow:hidden;display:flex;gap:2px}
.stat-bar-home{height:100%;background:var(--blue);border-radius:99px}
.stat-bar-away{height:100%;background:var(--purple);border-radius:99px;margin-left:auto}

/* ── kv table ── */
.kv{width:100%;border-collapse:collapse}
.kv tr{border-bottom:.5px solid var(--bd)}
.kv tr:last-child{border-bottom:none}
.kv td{padding:7px 0;font-size:13px}
.kv td:first-child{color:var(--tm);padding-right:1rem}
.kv td:last-child{color:var(--t);text-align:right;font-weight:500}

/* ── odds table ── */
.odds-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.odds-box{background:var(--s2);border-radius:var(--r);padding:.75rem;text-align:center}
.odds-box .ob-label{font-size:10px;color:var(--tm);margin-bottom:4px;text-transform:uppercase;letter-spacing:.07em}
.odds-box .ob-val{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fff}
.odds-box .ob-prob{font-size:11px;color:var(--td);margin-top:2px}
.odds-box .ob-move{font-size:10px;margin-top:3px}
.move-up{color:var(--green)}
.move-down{color:var(--red)}

/* ── prediction ── */
.pred-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1rem}
.pred-box{background:var(--s2);border-radius:var(--r);padding:.875rem;text-align:center}
.pred-box .pb-label{font-size:10px;color:var(--tm);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em}
.pred-box .pb-val{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700}
.pred-box .pb-sub{font-size:11px;color:var(--td);margin-top:3px}
.prob-bar{height:6px;background:var(--s2);border-radius:99px;overflow:hidden;margin-bottom:6px}
.prob-fill{height:100%;border-radius:99px;transition:width .5s ease}

/* ── form dots ── */
.form-row{display:flex;align-items:center;gap:6px;margin-bottom:.625rem}
.form-team{font-size:12px;color:var(--tm);min-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.form-dots{display:flex;gap:4px}
.dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
.dot-w{background:rgba(74,222,128,.2);color:var(--green)}
.dot-d{background:rgba(251,191,36,.15);color:var(--yellow)}
.dot-l{background:rgba(248,113,113,.15);color:var(--red)}
.dot-u{background:var(--s2);color:var(--td)}

/* ── lineup ── */
.lineup-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.lineup-col{}
.lineup-col-title{font-size:11px;color:var(--tm);margin-bottom:.625rem;font-weight:500}
.player-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:.5px solid var(--bd)}
.player-row:last-child{border-bottom:none}
.pnum{font-size:11px;color:var(--td);min-width:20px}
.pname{font-size:13px;color:var(--t)}
.ppos{font-size:10px;color:var(--tm);margin-left:auto;background:var(--s2);padding:2px 7px;border-radius:20px}

/* ── incident feed ── */
.incident{display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:.5px solid var(--bd)}
.incident:last-child{border-bottom:none}
.inc-min{font-size:11px;color:var(--td);min-width:32px;padding-top:2px}
.inc-icon{font-size:14px;min-width:20px;text-align:center}
.inc-body{font-size:13px;color:var(--t)}
.inc-body small{color:var(--tm);font-size:11px}

/* ── badge ── */
.badge{display:inline-block;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:500}
.badge-rec{background:rgba(74,222,128,.15);color:var(--green)}
.badge-no{background:rgba(248,113,113,.1);color:var(--red)}

/* ── weather ── */
.weather-row{display:flex;gap:1rem;flex-wrap:wrap}
.w-item{display:flex;flex-direction:column;gap:2px}
.w-item .wl{font-size:11px;color:var(--tm)}
.w-item .wv{font-size:15px;font-weight:500;color:var(--t)}

/* ── raw json toggle ── */
.raw-toggle{font-size:11px;color:var(--td);cursor:pointer;padding:4px 0;display:flex;align-items:center;gap:4px}
.raw-toggle:hover{color:var(--tm)}
pre.raw{background:var(--s2);border-radius:var(--r);padding:1rem;font-size:11px;color:var(--tm);overflow:auto;max-height:400px;display:none;margin-top:.5rem;line-height:1.5}

/* ── states ── */
.loading{display:flex;align-items:center;gap:8px;color:var(--tm);font-size:13px;padding:1rem 0}
.spin{width:14px;height:14px;border:2px solid var(--bd);border-top-color:var(--green);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{color:var(--td);font-size:13px;padding:.5rem 0}
.err{color:var(--red);font-size:13px;padding:.5rem 0;background:rgba(248,113,113,.07);border-radius:var(--r);padding:.75rem 1rem}

/* ── no data placeholder ── */
.no-data{color:var(--td);font-size:13px;font-style:italic}
</style>
</head>
<body>
<div class="shell">

  <div class="hdr">
    <div class="hdr-eye">⚽ BSD Football API</div>
    <h1>Scout</h1>
    <p>Datos reales de partido — evento, estadísticas, alineaciones, cuotas, predicción ML, H2H.</p>
  </div>

  <!-- Search -->
  <div class="search-wrap">
    <input id="searchInput" type="text" placeholder="Busca un equipo… ej. Barcelona, Liverpool, PSG"
      onkeydown="if(event.key==='Enter') searchTeam()">
    <button class="btn btn-green" onclick="searchTeam()" id="searchBtn">Buscar</button>
  </div>
  <div id="searchStatus"></div>
  <div class="event-list" id="eventList"></div>

  <!-- Match data -->
  <div id="matchArea" style="display:none">
    <div id="matchLoading" class="loading" style="display:none"><div class="spin"></div> Cargando datos del partido…</div>
    <div id="matchContent"></div>
  </div>

</div>

<script>
// ── state ──────────────────────────────────────────────────────
let currentTab = 'overview';
let matchData  = null;
let selectedEventId = null;

// ── search ─────────────────────────────────────────────────────
async function searchTeam() {
  const q = document.getElementById('searchInput').value.trim();
  if (q.length < 2) return;

  const btn = document.getElementById('searchBtn');
  btn.disabled = true;
  setStatus('<div class="loading"><div class="spin"></div> Buscando…</div>');
  document.getElementById('eventList').innerHTML = '';
  document.getElementById('matchArea').style.display = 'none';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderEventList(data);
  } catch(e) {
    setStatus(`<div class="err">❌ ${e.message}</div>`);
  }
  btn.disabled = false;
}

function setStatus(html) {
  document.getElementById('searchStatus').innerHTML = html;
}

function renderEventList(data) {
  const list = document.getElementById('eventList');
  let events = [];

  // Collect all fixtures across teams
  (data.fixtures || []).forEach(({ team, fixtures }) => {
    (fixtures || []).forEach(f => {
      if (!events.find(e => e.id === f.id)) events.push(f);
    });
  });

  if (events.length === 0) {
    setStatus('<div class="empty">No se encontraron partidos próximos para ese equipo.</div>');
    return;
  }

  events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  setStatus(`<div style="font-size:12px;color:var(--tm);margin-bottom:.5rem">${events.length} partido(s) encontrado(s) — selecciona uno:</div>`);

  list.innerHTML = events.map(e => {
    const d = new Date(e.event_date);
    const dateStr = d.toLocaleDateString('es', { weekday:'short', day:'numeric', month:'short' });
    const timeStr = d.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
    return `
      <div class="event-row" onclick="loadMatch(${e.id}, this)" data-id="${e.id}">
        <div style="flex:1">
          <div class="er-teams">${e.home_team} <span>vs</span> ${e.away_team}</div>
          <div class="er-league">${e.round_name||'Jornada '+e.round_number||''}</div>
        </div>
        <div class="er-meta">${dateStr}<br>${timeStr}</div>
      </div>`;
  }).join('');
}

// ── load match ─────────────────────────────────────────────────
async function loadMatch(eventId, rowEl) {
  document.querySelectorAll('.event-row').forEach(r => r.classList.remove('active'));
  if (rowEl) rowEl.classList.add('active');

  selectedEventId = eventId;
  const area = document.getElementById('matchArea');
  const loading = document.getElementById('matchLoading');
  const content = document.getElementById('matchContent');

  area.style.display = 'block';
  loading.style.display = 'flex';
  content.innerHTML = '';

  try {
    const res = await fetch(`/api/match?id=${eventId}`);
    matchData = await res.json();
    loading.style.display = 'none';
    renderMatch();
  } catch(e) {
    loading.style.display = 'none';
    content.innerHTML = `<div class="err">❌ ${e.message}</div>`;
  }
}

// ── render match ───────────────────────────────────────────────
function renderMatch() {
  const d = matchData;
  const ev = d.event;
  if (!ev) {
    document.getElementById('matchContent').innerHTML = '<div class="err">No se pudo cargar el evento.</div>';
    return;
  }

  const tabs = [
    { id:'overview',    label:'Resumen' },
    { id:'odds',        label:'Cuotas' },
    { id:'prediction',  label:'Predicción ML' },
    { id:'stats',       label:'Estadísticas' },
    { id:'lineups',     label:'Alineaciones' },
    { id:'form',        label:'Forma reciente' },
    { id:'h2h',         label:'H2H' },
    { id:'incidents',   label:'Incidentes' },
    { id:'raw',         label:'JSON crudo' },
  ];

  const tabsHTML = tabs.map(t =>
    `<div class="tab ${t.id===currentTab?'active':''}" onclick="switchTab('${t.id}')">${t.label}</div>`
  ).join('');

  document.getElementById('matchContent').innerHTML = `
    <div id="matchHeader"></div>
    <div class="tabs">${tabsHTML}</div>
    <div id="tabContent"></div>
  `;

  renderHeader(ev);
  renderTab(currentTab);
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.textContent === document.querySelector(`.tab.active`)?.textContent
      ? false : t.onclick.toString().includes(`'${tab}'`));
  });
  // Simpler: re-render all tabs
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    if (t.getAttribute('onclick')?.includes(`'${tab}'`)) t.classList.add('active');
  });
  renderTab(tab);
}

// ── header (scoreboard) ────────────────────────────────────────
function renderHeader(ev) {
  const statusClass = ev.status === 'finished' ? 'status-fin'
    : ['1st_half','2nd_half','halftime','inprogress'].includes(ev.status) ? 'status-live'
    : 'status-ns';
  const statusLabel = { notstarted:'Por jugar', finished:'Finalizado', '1st_half':'1ª parte',
    '2nd_half':'2ª parte', halftime:'Descanso', inprogress:'En juego', postponed:'Aplazado' }[ev.status] || ev.status;

  const d = new Date(ev.event_date);
  const dateStr = d.toLocaleDateString('es', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const timeStr = d.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });

  document.getElementById('matchHeader').innerHTML = `
    <div class="sec" style="margin-bottom:1rem">
      <div style="text-align:center;margin-bottom:.875rem">
        <span class="status-pill ${statusClass}">${statusLabel}</span>
        ${ev.status==='1st_half'||ev.status==='2nd_half'?`<span style="margin-left:8px;font-size:12px;color:var(--tm)">${ev.current_minute}'</span>`:''}
      </div>
      <div class="scoreboard">
        <div class="sb-team">
          <div class="sb-team-name">${ev.home_team}</div>
          <div class="sb-team-sub">Local</div>
        </div>
        <div class="sb-score">
          ${ev.status==='notstarted'
            ? `<span style="font-size:22px;color:var(--td)">${timeStr}</span>`
            : `${ev.home_score ?? '–'} <span style="color:var(--td)">:</span> ${ev.away_score ?? '–'}`}
        </div>
        <div class="sb-team">
          <div class="sb-team-name">${ev.away_team}</div>
          <div class="sb-team-sub">Visitante</div>
        </div>
      </div>
      <div style="text-align:center;font-size:12px;color:var(--tm)">${dateStr}</div>
      ${ev.is_local_derby?'<div style="text-align:center;margin-top:6px"><span class="badge badge-rec">Derby local</span></div>':''}
    </div>`;
}

// ── tab router ─────────────────────────────────────────────────
function renderTab(tab) {
  const content = document.getElementById('tabContent');
  switch(tab) {
    case 'overview':   content.innerHTML = tabOverview();   break;
    case 'odds':       content.innerHTML = tabOdds();       break;
    case 'prediction': content.innerHTML = tabPrediction(); break;
    case 'stats':      content.innerHTML = tabStats();      break;
    case 'lineups':    content.innerHTML = tabLineups();    break;
    case 'form':       content.innerHTML = tabForm();       break;
    case 'h2h':        content.innerHTML = tabH2H();        break;
    case 'incidents':  content.innerHTML = tabIncidents();  break;
    case 'raw':        content.innerHTML = tabRaw();        break;
  }
}

// ── OVERVIEW ───────────────────────────────────────────────────
function tabOverview() {
  const ev = matchData.event;
  const meta = matchData.metadata;
  const pred = matchData.prediction;

  let weather = '';
  if (ev.weather && ev.weather.temperature_c != null) {
    weather = `
      <div class="weather-row">
        <div class="w-item"><div class="wl">Temperatura</div><div class="wv">${ev.weather.temperature_c}°C</div></div>
        <div class="w-item"><div class="wl">Viento</div><div class="wv">${ev.weather.wind_speed ?? '—'} km/h</div></div>
        <div class="w-item"><div class="wl">Condición</div><div class="wv">${ev.weather.description || '—'}</div></div>
      </div>`;
  }

  let quickPred = '';
  if (pred && pred.recommendations) {
    const r = pred.recommendations;
    const fav = r.favorite === 'H' ? ev.home_team : r.favorite === 'A' ? ev.away_team : 'Empate';
    quickPred = `
      <div class="sec">
        <div class="sec-title">Predicción rápida (ML)</div>
        <table class="kv">
          <tr><td>Favorito</td><td>${fav} (${(r.favorite_prob*100).toFixed(1)}%)</td></tr>
          <tr><td>Apostar favorito</td><td><span class="badge ${r.bet_favorite?'badge-rec':'badge-no'}">${r.bet_favorite?'Sí':'No'}</span></td></tr>
          <tr><td>Over 1.5</td><td><span class="badge ${r.over_15?'badge-rec':'badge-no'}">${r.over_15?'Sí':'No'}</span></td></tr>
          <tr><td>Over 2.5</td><td><span class="badge ${r.over_25?'badge-rec':'badge-no'}">${r.over_25?'Sí':'No'}</span></td></tr>
          <tr><td>BTTS</td><td><span class="badge ${r.btts?'badge-rec':'badge-no'}">${r.btts?'Sí':'No'}</span></td></tr>
          <tr><td>Confianza del modelo</td><td>${pred.model?.confidence != null ? (pred.model.confidence*100).toFixed(1)+'%' : '—'}</td></tr>
        </table>
      </div>`;
  }

  const previewText = meta?.preview_text || meta?.preview || '';

  return `
    <div class="sec">
      <div class="sec-title">Datos del partido</div>
      <table class="kv">
        <tr><td>Competición</td><td>${ev.league_id}</td></tr>
        <tr><td>Jornada</td><td>${ev.round_name || ev.round_number || '—'}</td></tr>
        ${ev.group_name ? `<tr><td>Grupo</td><td>${ev.group_name}</td></tr>` : ''}
        <tr><td>Derby local</td><td>${ev.is_local_derby ? 'Sí' : 'No'}</td></tr>
        <tr><td>Terreno neutral</td><td>${ev.is_neutral_ground ? 'Sí' : 'No'}</td></tr>
        ${ev.travel_distance_km ? `<tr><td>Distancia viaje visitante</td><td>${ev.travel_distance_km} km</td></tr>` : ''}
        ${ev.attendance ? `<tr><td>Asistencia</td><td>${ev.attendance.toLocaleString()}</td></tr>` : ''}
        ${ev.pitch_condition ? `<tr><td>Estado del campo</td><td>${ev.pitch_condition}</td></tr>` : ''}
      </table>
    </div>
    ${weather ? `<div class="sec"><div class="sec-title">Clima</div>${weather}</div>` : ''}
    ${previewText ? `<div class="sec"><div class="sec-title">Preview IA</div><p style="font-size:13px;color:var(--tm);line-height:1.65">${previewText}</p></div>` : ''}
    ${quickPred}
  `;
}

// ── ODDS ───────────────────────────────────────────────────────
function tabOdds() {
  const comp = matchData.oddsComparison;
  const ev   = matchData.event;

  if (!comp || !comp.markets || Object.keys(comp.markets).length === 0) {
    return '<div class="sec"><div class="no-data">No hay cuotas disponibles para este partido.</div></div>';
  }

  const marketLabels = {
    '1x2':'1X2', 'over_under_25':'Over/Under 2.5', 'over_under_15':'Over/Under 1.5',
    'over_under_35':'Over/Under 3.5', 'btts':'Ambos marcan', 'double_chance':'Doble oportunidad',
    'draw_no_bet':'Sin empate', 'total_corners':'Córners', 'total_red_cards':'Tarjetas rojas',
  };

  const outcomeLabels = {
    'HOME': ev.home_team, 'AWAY': ev.away_team, 'DRAW':'Empate',
    'over':'Over', 'under':'Under', 'yes':'Sí', 'no':'No',
    '1X':'1X', '12':'12', 'X2':'X2',
  };

  let html = '';
  Object.entries(comp.markets).forEach(([market, outcomes]) => {
    if (!outcomes || typeof outcomes !== 'object') return;
    const title = marketLabels[market] || market;

    // consensus + best odds per outcome
    const rows = Object.entries(outcomes).map(([outcome, books]) => {
      const label = outcomeLabels[outcome] || outcome;
      const cons = books?.consensus;
      const best = Object.entries(books || {})
        .filter(([k]) => k !== 'consensus')
        .sort((a,b) => (b[1]?.decimal_odds||0) - (a[1]?.decimal_odds||0))[0];

      return { label, cons, best: best ? { bookie: best[0], ...best[1] } : null };
    });

    html += `
      <div class="sec">
        <div class="sec-title">${title}</div>
        <div class="odds-grid">
          ${rows.map(r => {
            const o = r.cons?.decimal_odds;
            const prob = o ? (1/o*100).toFixed(1) : null;
            const mv = r.cons?.movement;
            const moveHTML = mv === 'SHORTENING'
              ? `<div class="ob-move move-up">▲ acortando</div>`
              : mv === 'DRIFTING'
              ? `<div class="ob-move move-down">▼ subiendo</div>` : '';
            return `
              <div class="odds-box">
                <div class="ob-label">${r.label}</div>
                <div class="ob-val">${o ? o.toFixed(2) : '—'}</div>
                ${prob ? `<div class="ob-prob">${prob}% impl.</div>` : ''}
                ${moveHTML}
                ${r.best ? `<div style="font-size:10px;color:var(--td);margin-top:3px">mejor: ${r.best.decimal_odds?.toFixed(2)} (${r.best.bookie})</div>` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  });

  return html || '<div class="sec"><div class="no-data">Sin datos de cuotas.</div></div>';
}

// ── PREDICTION ─────────────────────────────────────────────────
function tabPrediction() {
  const pred = matchData.prediction;
  const ev   = matchData.event;

  if (!pred) return '<div class="sec"><div class="no-data">No hay predicción ML para este partido.</div></div>';

  const mr   = pred.markets?.match_result || {};
  const eg   = pred.markets?.expected_goals || {};
  const ou   = pred.markets?.over_under || {};
  const btts = pred.markets?.btts || {};
  const sc   = pred.markets?.score || {};
  const rec  = pred.recommendations || {};

  const homeP  = mr.home_win  ?? 0;
  const drawP  = mr.draw      ?? 0;
  const awayP  = mr.away_win  ?? 0;

  function pbar(val, color='var(--blue)') {
    const pct = Math.round((val||0)*100);
    return `<div class="prob-bar"><div class="prob-fill" style="width:${pct}%;background:${color}"></div></div>`;
  }

  const scoreEntries = Object.entries(sc)
    .filter(([,v]) => v > 0.01)
    .sort((a,b) => b[1]-a[1])
    .slice(0,6);

  return `
    <div class="sec">
      <div class="sec-title">Resultado del partido</div>
      <div class="pred-grid">
        <div class="pred-box">
          <div class="pb-label">${ev.home_team}</div>
          ${pbar(homeP,'var(--blue)')}
          <div class="pb-val" style="color:var(--blue)">${(homeP*100).toFixed(1)}%</div>
          <div class="pb-sub">victoria local</div>
        </div>
        <div class="pred-box">
          <div class="pb-label">Empate</div>
          ${pbar(drawP,'var(--yellow)')}
          <div class="pb-val" style="color:var(--yellow)">${(drawP*100).toFixed(1)}%</div>
          <div class="pb-sub">empate</div>
        </div>
        <div class="pred-box">
          <div class="pb-label">${ev.away_team}</div>
          ${pbar(awayP,'var(--purple)')}
          <div class="pb-val" style="color:var(--purple)">${(awayP*100).toFixed(1)}%</div>
          <div class="pb-sub">victoria visitante</div>
        </div>
      </div>
    </div>

    <div class="g2">
      <div class="sec">
        <div class="sec-title">Goles esperados (xG)</div>
        <table class="kv">
          <tr><td>${ev.home_team}</td><td>${eg.home_xg?.toFixed(2) ?? '—'}</td></tr>
          <tr><td>${ev.away_team}</td><td>${eg.away_xg?.toFixed(2) ?? '—'}</td></tr>
          <tr><td>Total esperado</td><td>${eg.total_xg?.toFixed(2) ?? '—'}</td></tr>
        </table>
      </div>
      <div class="sec">
        <div class="sec-title">Over / Under</div>
        <table class="kv">
          <tr><td>Over 1.5</td><td>${ou.over_15 != null ? (ou.over_15*100).toFixed(1)+'%':ou.over_15_prob!=null?(ou.over_15_prob*100).toFixed(1)+'%':'—'}</td></tr>
          <tr><td>Over 2.5</td><td>${ou.over_25 != null ? (ou.over_25*100).toFixed(1)+'%':ou.over_25_prob!=null?(ou.over_25_prob*100).toFixed(1)+'%':'—'}</td></tr>
          <tr><td>Over 3.5</td><td>${ou.over_35 != null ? (ou.over_35*100).toFixed(1)+'%':ou.over_35_prob!=null?(ou.over_35_prob*100).toFixed(1)+'%':'—'}</td></tr>
          <tr><td>BTTS (Ambos marcan)</td><td>${btts.yes != null ? (btts.yes*100).toFixed(1)+'%':btts.btts_prob!=null?(btts.btts_prob*100).toFixed(1)+'%':'—'}</td></tr>
        </table>
      </div>
    </div>

    ${scoreEntries.length ? `
      <div class="sec">
        <div class="sec-title">Marcadores más probables</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${scoreEntries.map(([score, prob]) => `
            <div style="background:var(--s2);border-radius:var(--r);padding:.5rem .875rem;text-align:center">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#fff">${score}</div>
              <div style="font-size:11px;color:var(--tm);margin-top:2px">${(prob*100).toFixed(1)}%</div>
            </div>`).join('')}
        </div>
      </div>` : ''}

    <div class="sec">
      <div class="sec-title">Recomendaciones del modelo</div>
      <table class="kv">
        ${Object.entries(rec).map(([k,v]) => {
          const labels = { favorite:'Favorito', favorite_prob:'Prob. favorito', bet_favorite:'Apostar favorito',
            over_15:'Over 1.5', over_25:'Over 2.5', over_35:'Over 3.5', btts:'Ambos marcan', winner:'Apostar al ganador' };
          let val = typeof v === 'boolean'
            ? `<span class="badge ${v?'badge-rec':'badge-no'}">${v?'Sí':'No'}</span>`
            : typeof v === 'number' ? (v > 0 && v <= 1 ? (v*100).toFixed(1)+'%' : v)
            : (v === 'H' ? ev.home_team : v === 'A' ? ev.away_team : v === 'D' ? 'Empate' : v);
          return `<tr><td>${labels[k]||k}</td><td>${val}</td></tr>`;
        }).join('')}
      </table>
    </div>

    <div class="sec" style="background:rgba(96,165,250,.04)">
      <div class="sec-title">Modelo</div>
      <table class="kv">
        <tr><td>Versión</td><td>${pred.model?.version || '—'}</td></tr>
        <tr><td>Confianza</td><td>${pred.model?.confidence != null ? (pred.model.confidence*100).toFixed(1)+'%':'—'}</td></tr>
        <tr><td>Generado</td><td>${pred.created_at ? new Date(pred.created_at).toLocaleString('es'):''}</td></tr>
      </table>
    </div>
  `;
}

// ── STATS ──────────────────────────────────────────────────────
function tabStats() {
  const stats = matchData.stats;
  const ev    = matchData.event;
  if (!stats) return '<div class="sec"><div class="no-data">No hay estadísticas disponibles (partido no comenzó o no indexado).</div></div>';

  const home = stats.home || stats.stats?.home || {};
  const away = stats.away || stats.stats?.away || {};

  const rows = [
    ['Posesión', 'possession', '%'],
    ['Tiros totales', 'shots_total', ''],
    ['Tiros a puerta', 'shots_on_target', ''],
    ['Tiros fuera', 'shots_off_target', ''],
    ['Córners', 'corners', ''],
    ['Faltas', 'fouls', ''],
    ['Tarjetas amarillas', 'yellow_cards', ''],
    ['Tarjetas rojas', 'red_cards', ''],
    ['Fueras de juego', 'offsides', ''],
    ['xG', 'xg', ''],
    ['Pases', 'passes', ''],
    ['Pases precisos', 'accurate_passes', ''],
    ['Duelos ganados', 'duels_won', ''],
    ['Salidas del portero', 'goalkeeper_saves', ''],
  ];

  const rowsHTML = rows.map(([label, key, unit]) => {
    const hv = home[key] ?? null;
    const av = away[key] ?? null;
    if (hv === null && av === null) return '';

    const h = parseFloat(hv) || 0;
    const a = parseFloat(av) || 0;
    const total = h + a || 1;
    const hPct = Math.round(h / total * 100);
    const aPct = 100 - hPct;

    return `
      <div class="stat-bar-row">
        <div class="stat-bar-labels">
          <span>${h}${unit}</span>
          <span class="name">${label}</span>
          <span>${a}${unit}</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-home" style="width:${hPct}%"></div>
          <div class="stat-bar-away" style="width:${aPct}%"></div>
        </div>
      </div>`;
  }).filter(Boolean).join('');

  return `
    <div class="sec">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tm);margin-bottom:1rem">
        <span style="color:var(--blue);font-weight:500">${ev.home_team}</span>
        <span style="color:var(--tm)">vs</span>
        <span style="color:var(--purple);font-weight:500">${ev.away_team}</span>
      </div>
      ${rowsHTML || '<div class="no-data">Sin estadísticas numéricas disponibles.</div>'}
    </div>`;
}

// ── LINEUPS ────────────────────────────────────────────────────
function tabLineups() {
  const lin = matchData.lineups;
  const ev  = matchData.event;

  if (!lin || lin.lineup_status === 'unavailable' || !lin.lineups) {
    return `<div class="sec"><div class="no-data">Alineaciones no disponibles aún (${lin?.lineup_status || 'sin datos'}).</div></div>`;
  }

  const home = lin.lineups?.home || {};
  const away = lin.lineups?.away || {};

  function renderPlayers(side) {
    const players = side?.players || side?.starting_xi || side?.lineup || [];
    if (!players.length) return '<div class="no-data">Sin datos</div>';
    return players.map(p => `
      <div class="player-row">
        <span class="pnum">${p.jersey_number || p.number || ''}</span>
        <span class="pname">${p.name || p.player_name || '—'}</span>
        <span class="ppos">${p.position || p.pos || ''}</span>
      </div>`).join('');
  }

  const unavH = lin.unavailable_players?.home || [];
  const unavA = lin.unavailable_players?.away || [];

  const statusLabel = { confirmed:'✅ Confirmada', predicted:'🤖 Predicha (IA)', unavailable:'Sin datos' };

  return `
    <div class="sec">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.875rem">
        <div class="sec-title" style="margin-bottom:0">Alineaciones</div>
        <span class="badge badge-${lin.lineup_status==='confirmed'?'rec':'no'}">${statusLabel[lin.lineup_status]||lin.lineup_status}</span>
      </div>
      <div class="lineup-grid">
        <div class="lineup-col">
          <div class="lineup-col-title">${ev.home_team}</div>
          ${renderPlayers(home)}
        </div>
        <div class="lineup-col">
          <div class="lineup-col-title">${ev.away_team}</div>
          ${renderPlayers(away)}
        </div>
      </div>
    </div>

    ${(unavH.length || unavA.length) ? `
      <div class="sec">
        <div class="sec-title">Bajas / no disponibles</div>
        <div class="g2">
          <div>
            <div style="font-size:11px;color:var(--tm);margin-bottom:.5rem">${ev.home_team}</div>
            ${unavH.length ? unavH.map(p=>`<div style="font-size:13px;color:var(--red);margin-bottom:3px">❌ ${p.name||p}</div>`).join('') : '<div class="no-data">Sin bajas</div>'}
          </div>
          <div>
            <div style="font-size:11px;color:var(--tm);margin-bottom:.5rem">${ev.away_team}</div>
            ${unavA.length ? unavA.map(p=>`<div style="font-size:13px;color:var(--red);margin-bottom:3px">❌ ${p.name||p}</div>`).join('') : '<div class="no-data">Sin bajas</div>'}
          </div>
        </div>
      </div>` : ''}
  `;
}

// ── FORM ───────────────────────────────────────────────────────
function tabForm() {
  const ev  = matchData.event;
  const hf  = matchData.homeForm || [];
  const af  = matchData.awayForm || [];

  function formDots(fixtures, teamId) {
    if (!fixtures.length) return '<div class="no-data">Sin datos de forma</div>';
    return `<div class="form-dots">${fixtures.slice(0,6).map(f => {
      const isHome = f.home_team_id === teamId;
      const ts = isHome ? f.home_score : f.away_score;
      const os = isHome ? f.away_score : f.home_score;
      const res = ts > os ? 'W' : ts < os ? 'L' : 'D';
      const cls = res==='W'?'dot-w':res==='L'?'dot-l':'dot-d';
      const opp = isHome ? f.away_team : f.home_team;
      return `<div class="dot ${cls}" title="${res} vs ${opp} (${ts}-${os})">${res}</div>`;
    }).join('')}</div>`;
  }

  function recentTable(fixtures, teamId) {
    if (!fixtures.length) return '<div class="no-data">Sin partidos recientes</div>';
    return fixtures.slice(0,6).map(f => {
      const isHome = f.home_team_id === teamId;
      const ts = isHome ? f.home_score : f.away_score;
      const os = isHome ? f.away_score : f.home_score;
      const res = ts > os ? 'W' : ts < os ? 'L' : 'D';
      const resColor = res==='W'?'var(--green)':res==='L'?'var(--red)':'var(--yellow)';
      const opp = isHome ? f.away_team : f.home_team;
      const d = new Date(f.event_date).toLocaleDateString('es',{day:'numeric',month:'short'});
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:.5px solid var(--bd)">
          <span style="font-size:11px;color:var(--td);min-width:50px">${d}</span>
          <span style="font-size:13px;color:var(--tm);flex:1">${isHome?'vs':'@'} ${opp}</span>
          <span style="font-size:13px;color:var(--tm)">${f.home_score}–${f.away_score}</span>
          <span style="font-size:11px;font-weight:600;color:${resColor};min-width:14px">${res}</span>
        </div>`;
    }).join('');
  }

  return `
    <div class="sec">
      <div class="sec-title">Últimos 6 partidos</div>
      <div style="margin-bottom:1rem">
        <div class="form-row" style="margin-bottom:.75rem">
          <div class="form-team">${ev.home_team}</div>
          ${formDots(hf, ev.home_team_id)}
        </div>
        <div class="form-row">
          <div class="form-team">${ev.away_team}</div>
          ${formDots(af, ev.away_team_id)}
        </div>
      </div>
    </div>

    <div class="g2">
      <div class="sec">
        <div class="sec-title">${ev.home_team}</div>
        ${recentTable(hf, ev.home_team_id)}
      </div>
      <div class="sec">
        <div class="sec-title">${ev.away_team}</div>
        ${recentTable(af, ev.away_team_id)}
      </div>
    </div>
  `;
}

// ── H2H ────────────────────────────────────────────────────────
function tabH2H() {
  const h2h = matchData.h2h;
  const ev  = matchData.event;

  if (!h2h || Object.values(h2h).every(v => v === null)) {
    return '<div class="sec"><div class="no-data">Sin historial H2H indexado.</div></div>';
  }

  return `
    <div class="sec">
      <div class="sec-title">Historial cabeza a cabeza</div>
      <table class="kv">
        ${Object.entries(h2h).map(([k, v]) => {
          if (v === null || v === undefined) return '';
          const labels = {
            total_matches:'Partidos totales', home_wins:`Victorias ${ev.home_team}`,
            away_wins:`Victorias ${ev.away_team}`, draws:'Empates',
            home_goals:`Goles ${ev.home_team}`, away_goals:`Goles ${ev.away_team}`,
            avg_goals:'Goles por partido (media)', btts_pct:'BTTS %',
            over_25_pct:'Over 2.5 %',
          };
          return `<tr><td>${labels[k]||k}</td><td>${typeof v==='number'&&v>0&&v<=1?(v*100).toFixed(1)+'%':v}</td></tr>`;
        }).filter(Boolean).join('')}
      </table>
    </div>`;
}

// ── INCIDENTS ─────────────────────────────────────────────────
function tabIncidents() {
  const inc = matchData.incidents;
  const ev  = matchData.event;

  if (!inc || !Array.isArray(inc) || inc.length === 0) {
    return '<div class="sec"><div class="no-data">Sin incidentes registrados.</div></div>';
  }

  const iconMap = { goal:'⚽', yellow_card:'🟨', red_card:'🟥', substitution:'🔄', var:'📺', penalty:'🥅' };

  return `
    <div class="sec">
      <div class="sec-title">Incidentes del partido</div>
      ${inc.sort((a,b)=>(a.minute||0)-(b.minute||0)).map(i => {
        const icon = iconMap[i.type] || '•';
        const side = i.team_id === ev.home_team_id ? ev.home_team : ev.away_team;
        return `
          <div class="incident">
            <span class="inc-min">${i.minute || i.time || '?'}'</span>
            <span class="inc-icon">${icon}</span>
            <div class="inc-body">
              ${i.player_name || i.player || ''}
              ${i.assist_name ? `<small> (assist: ${i.assist_name})</small>` : ''}
              ${i.in_player_name ? `→ ${i.in_player_name}` : ''}
              <small> — ${side}</small>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ── RAW JSON ───────────────────────────────────────────────────
function tabRaw() {
  const sections = [
    { key:'event',          label:'Evento' },
    { key:'prediction',     label:'Predicción ML' },
    { key:'oddsComparison', label:'Cuotas (comparación)' },
    { key:'stats',          label:'Estadísticas' },
    { key:'lineups',        label:'Alineaciones' },
    { key:'h2h',            label:'H2H' },
    { key:'incidents',      label:'Incidentes' },
    { key:'homeForm',       label:'Forma local (reciente)' },
    { key:'awayForm',       label:'Forma visitante (reciente)' },
    { key:'metadata',       label:'Metadata' },
    { key:'playerStats',    label:'Stats de jugadores' },
  ];

  return sections.map(s => {
    const data = matchData[s.key];
    const id = 'raw_' + s.key;
    return `
      <div class="sec">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="sec-title" style="margin-bottom:0">${s.label}</div>
          <div class="raw-toggle" onclick="toggleRaw('${id}')">▶ ver JSON</div>
        </div>
        <pre class="raw" id="${id}">${data ? JSON.stringify(data, null, 2) : 'null'}</pre>
      </div>`;
  }).join('');
}

function toggleRaw(id) {
  const pre = document.getElementById(id);
  const btn = pre.previousElementSibling.querySelector('.raw-toggle');
  if (pre.style.display === 'block') {
    pre.style.display = 'none';
    btn.textContent = '▶ ver JSON';
  } else {
    pre.style.display = 'block';
    btn.textContent = '▼ ocultar JSON';
  }
}
</script>
</body>
</html>
