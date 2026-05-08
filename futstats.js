/* =========================================================
   FUTSTATS — API Integration
   API: api-football.com via RapidAPI
   ========================================================= */

// ── STATE ──────────────────────────────────────────────────
const STATE = {
  apiKey: localStorage.getItem('futstats_api_key') || null,
  leagueId: 71,
  season: 2024,
  standingsData: [],
  showAllStandings: false,
  liveInterval: null,
};

// ── LEAGUE CONFIG ──────────────────────────────────────────
const LEAGUE_RULES = {
  71:  { total: 20, champion: 1, lib: 4,  sul: 6,  rel: 4 },
  72:  { total: 20, champion: 1, lib: 4,  sul: 0,  rel: 4 },
  73:  { total: 0,  champion: 1, lib: 0,  sul: 0,  rel: 0 },
  13:  { total: 0,  champion: 1, lib: 0,  sul: 0,  rel: 0 },
  11:  { total: 0,  champion: 1, lib: 0,  sul: 0,  rel: 0 },
  2:   { total: 0,  champion: 1, lib: 0,  sul: 0,  rel: 0 },
  3:   { total: 0,  champion: 1, lib: 0,  sul: 0,  rel: 0 },
  39:  { total: 20, champion: 1, lib: 4,  sul: 0,  rel: 3 },
  140: { total: 20, champion: 1, lib: 4,  sul: 0,  rel: 3 },
  78:  { total: 18, champion: 1, lib: 4,  sul: 0,  rel: 3 },
  135: { total: 20, champion: 1, lib: 4,  sul: 0,  rel: 3 },
  61:  { total: 18, champion: 1, lib: 4,  sul: 0,  rel: 3 },
};

// ── API HELPERS ────────────────────────────────────────────
async function apiFetch(endpoint, params = {}) {
  if (!STATE.apiKey) throw new Error('NO_KEY');

  const url = new URL(`https://v3.football.api-sports.io${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': STATE.apiKey,
    }
  });

  if (res.status === 401 || res.status === 403) throw new Error('INVALID_KEY');
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errMsg = Object.values(data.errors)[0];
    throw new Error(errMsg);
  }
  return data;
}

// ── API KEY ────────────────────────────────────────────────
function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key) return;
  STATE.apiKey = key;
  localStorage.setItem('futstats_api_key', key);
  document.getElementById('api-banner').style.display = 'none';
  loadAll();
}

function checkApiKey() {
  if (STATE.apiKey) {
    document.getElementById('api-banner').style.display = 'none';
    loadAll();
  } else {
    document.getElementById('api-banner').style.display = 'block';
    document.getElementById('standings-content').innerHTML = errorState('NO_KEY', null);
    document.getElementById('scorers-content').innerHTML   = errorState('NO_KEY', null);
    document.getElementById('matches-content').innerHTML   = errorState('NO_KEY', null);
  }
}

// ── LEAGUE CHANGE ──────────────────────────────────────────
function onLeagueChange() {
  const sel = document.getElementById('league-select');
  const opt = sel.options[sel.selectedIndex];
  STATE.leagueId = parseInt(sel.value);
  document.getElementById('league-flag').textContent = opt.dataset.flag || '🏆';
  STATE.showAllStandings = false;
  loadAll();
}

// ── LOAD ALL ───────────────────────────────────────────────
function loadAll() {
  if (!STATE.apiKey) return;
  loadStandings();
  loadScorers();
  loadMatches();
  loadLiveMatches();

  if (STATE.liveInterval) clearInterval(STATE.liveInterval);
  STATE.liveInterval = setInterval(loadLiveMatches, 60000);
}

// ── STANDINGS ──────────────────────────────────────────────
async function loadStandings() {
  const el = document.getElementById('standings-content');
  el.innerHTML = skeletonRows(10);

  try {
    const data = await apiFetch('/standings', {
      league: STATE.leagueId,
      season: STATE.season,
    });

    const groups = data.response?.[0]?.league?.standings;
    if (!groups || groups.length === 0) {
      el.innerHTML = emptyState('Nenhuma classificação disponível para esta liga/temporada.');
      return;
    }

    STATE.standingsData = groups[0];
    renderStandings();
  } catch (e) {
    el.innerHTML = errorState(e.message, 'loadStandings');
  }
}

function renderStandings() {
  const el = document.getElementById('standings-content');
  const data = [...STATE.standingsData];

  const sortVal = document.getElementById('sort-select').value;
  if (sortVal === 'goals_for') data.sort((a, b) => b.all.goals.for - a.all.goals.for);
  else if (sortVal === 'goal_diff') data.sort((a, b) => b.goalsDiff - a.goalsDiff);

  const display = STATE.showAllStandings ? data : data.slice(0, 10);

  const rows = display.map(team => {
    const pos = team.rank;
    const badgeClass = getBadgeClass(pos, STATE.leagueId, data.length);
    const form = (team.form || '').split('').slice(-5);
    const sg = team.goalsDiff;
    const sgClass = sg > 0 ? 'positive' : sg < 0 ? 'negative' : '';
    const sgText = sg > 0 ? `+${sg}` : `${sg}`;
    const highlightClass = pos === 1 ? 'row--highlight' : '';

    return `
      <tr class="${highlightClass}" data-position="${pos}">
        <td class="col-pos"><span class="pos-badge ${badgeClass}">${pos}</span></td>
        <td class="col-club">
          <img src="${team.team.logo}" alt="" class="team-logo" aria-hidden="true" onerror="this.style.display='none'" />
          <span class="team-name">${team.team.name}</span>
        </td>
        <td class="col-pts"><strong>${team.points}</strong></td>
        <td>${team.all.played}</td>
        <td>${team.all.win}</td>
        <td>${team.all.draw}</td>
        <td>${team.all.lose}</td>
        <td>${team.all.goals.for}</td>
        <td>${team.all.goals.against}</td>
        <td class="col-sg ${sgClass}">${sgText}</td>
        <td class="col-form">${renderForm(form)}</td>
      </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="table-wrapper" role="region" aria-label="Tabela de classificação" tabindex="0">
      <table class="standings-table">
        <thead>
          <tr>
            <th scope="col" class="col-pos" abbr="Posição">Pos</th>
            <th scope="col" class="col-club">Time</th>
            <th scope="col" abbr="Pontos">Pts</th>
            <th scope="col" abbr="Jogos">J</th>
            <th scope="col" abbr="Vitórias">V</th>
            <th scope="col" abbr="Empates">E</th>
            <th scope="col" abbr="Derrotas">D</th>
            <th scope="col" abbr="Gols Pró">GP</th>
            <th scope="col" abbr="Gols Contra">GC</th>
            <th scope="col" abbr="Saldo de Gols">SG</th>
            <th scope="col" class="col-form" abbr="Últimos jogos">Forma</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  const btn = document.getElementById('standings-show-all');
  if (STATE.standingsData.length > 10) {
    btn.style.display = '';
    btn.textContent = STATE.showAllStandings ? 'Ver menos ↑' : 'Ver tabela completa →';
  } else {
    btn.style.display = 'none';
  }
}

function sortStandings() {
  renderStandings();
}

function toggleShowAll(section) {
  if (section === 'standings') {
    STATE.showAllStandings = !STATE.showAllStandings;
    renderStandings();
  }
}

// ── BADGE CLASS ─────────────────────────────────────────────
function getBadgeClass(pos, leagueId, total) {
  const rules = LEAGUE_RULES[leagueId];

  if (!rules) {
    if (pos === 1) return 'pos--champion';
    if (pos <= 4)  return 'pos--lib';
    return '';
  }

  if (pos === rules.champion) return 'pos--champion';
  if (rules.rel > 0 && pos > total - rules.rel) return 'pos--rel';
  if (rules.lib > 0 && pos <= rules.lib) return 'pos--lib';
  if (rules.sul > 0 && pos <= rules.sul) return 'pos--sul';

  return '';
}

function renderForm(form) {
  return form.map(r => {
    if (r === 'W') return `<span class="form-dot form--win"  title="Vitória">V</span>`;
    if (r === 'D') return `<span class="form-dot form--draw" title="Empate">E</span>`;
    if (r === 'L') return `<span class="form-dot form--loss" title="Derrota">D</span>`;
    return '';
  }).join('');
}

// ── SCORERS ────────────────────────────────────────────────
async function loadScorers() {
  const el = document.getElementById('scorers-content');
  el.innerHTML = skeletonScorers(4);
  document.getElementById('scorers-season').textContent = STATE.season;

  try {
    const data = await apiFetch('/players/topscorers', {
      league: STATE.leagueId,
      season: STATE.season,
    });

    const players = data.response || [];
    if (players.length === 0) {
      el.innerHTML = emptyState('Nenhum artilheiro disponível.');
      return;
    }

    const rankClasses = ['scorer-item--gold', 'scorer-item--silver', 'scorer-item--bronze'];
    const items = players.slice(0, 5).map((entry, i) => {
      const p = entry.player;
      const stats = entry.statistics[0];
      const goals = stats.goals.total || 0;
      const club = stats.team.name;
      const clubLogo = stats.team.logo;
      const photo = p.photo;
      const rankClass = rankClasses[i] || '';

      return `
        <li class="scorer-item ${rankClass}">
          <span class="scorer-rank" aria-label="${i + 1}° lugar">${i + 1}</span>
          <div class="scorer-avatar" aria-hidden="true">
            <img src="${photo}" alt="" onerror="this.src='${clubLogo}'" />
          </div>
          <div class="scorer-info">
            <span class="scorer-name">${p.name}</span>
            <span class="scorer-club">${club}</span>
          </div>
          <div class="scorer-goals" aria-label="${goals} gols">
            <strong class="goals-count">${goals}</strong>
            <span class="goals-label">gols</span>
          </div>
        </li>`;
    }).join('');

    el.innerHTML = `<ol class="scorers-list" aria-label="Lista de artilheiros">${items}</ol>`;
  } catch (e) {
    el.innerHTML = errorState(e.message, 'loadScorers');
  }
}async function loadMatches() {
  const el = document.getElementById('matches-content');
  el.innerHTML = emptyState('Temporada 2024 encerrada. Próximos jogos disponíveis em 2025.');
}
// ── LIVE MATCHES ───────────────────────────────────────────
async function loadLiveMatches() {
  try {
    const data = await apiFetch('/fixtures', {
      league: STATE.leagueId,
      season: STATE.season,
      live: 'all',
    });

    const fixtures = data.response || [];
    const liveCard      = document.getElementById('live-card');
    const liveList      = document.getElementById('live-list');
    const liveIndicator = document.getElementById('live-indicator');
    const liveCount     = document.getElementById('live-count');

    if (fixtures.length === 0) {
      liveCard.style.display      = 'none';
      liveIndicator.style.display = 'none';
    } else {
      liveCard.style.display      = 'flex';
      liveIndicator.style.display = 'inline-flex';
      liveCount.textContent       = fixtures.length;
      liveList.innerHTML          = fixtures.map(f => renderMatchItem(f, true)).join('');
    }
  } catch (e) {
    // silent fail — live não é crítico
  }
}

function renderMatchItem(f, isLive) {
  const home  = f.teams.home;
  const away  = f.teams.away;
  const goals = f.goals;
  const dt      = new Date(f.fixture.date);
  const elapsed = f.fixture.status.elapsed;

  const scoreOrDash = (goals.home !== null && goals.away !== null)
    ? `${goals.home} : ${goals.away}`
    : '— : —';

  const timeStr = isLive
    ? `<span class="match-status-live">${elapsed || ''}′</span>`
    : `<time class="match-time" datetime="${f.fixture.date}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        ${formatDate(dt)}
      </time>`;

  const venue = f.fixture.venue?.name || '';
  const round = (f.league.round || '').replace('Regular Season - ', 'Rodada ');

  return `
    <li class="match-item${isLive ? ' match--live' : ''}">
      <div class="match-teams">
        <div class="match-team match-team--home">
          <img src="${home.logo}" alt="${home.name}" class="match-logo" onerror="this.style.display='none'" />
          <span class="match-team-name">${home.name}</span>
        </div>
        <div class="match-score">
          <span class="score-display">${scoreOrDash}</span>
          <span class="match-round">${round}</span>
        </div>
        <div class="match-team match-team--away">
          <img src="${away.logo}" alt="${away.name}" class="match-logo" onerror="this.style.display='none'" />
          <span class="match-team-name">${away.name}</span>
        </div>
      </div>
      <div class="match-meta">
        ${timeStr}
        <span class="match-stadium">${venue}</span>
      </div>
    </li>`;
}

// ── SEARCH ─────────────────────────────────────────────────
function handleSearch(e) {
  e.preventDefault();
  const q = document.getElementById('search-input').value.trim();
  if (!q || !STATE.apiKey) return;
  alert(`Busca por "${q}" — funcionalidade a implementar.`);
}

// ── UTILS ──────────────────────────────────────────────────
function formatDate(dt) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const d   = days[dt.getDay()];
  const day = String(dt.getDate()).padStart(2, '0');
  const mon = String(dt.getMonth() + 1).padStart(2, '0');
  const hr  = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${d}, ${day}/${mon} · ${hr}:${min}`;
}

function skeletonRows(n, h = 44) {
  return `<div class="skeleton-wrap">
    ${Array(n).fill(`<div class="skeleton skeleton-table-row" style="height:${h}px"></div>`).join('')}
  </div>`;
}

function skeletonScorers(n) {
  return `<div class="skeleton-wrap">
    ${Array(n).fill(`
      <div class="skeleton-row">
        <div class="skeleton skeleton-circle"></div>
        <div class="skeleton skeleton-text-md" style="flex:1"></div>
        <div class="skeleton skeleton-text-md" style="width:40px"></div>
      </div>`).join('')}
  </div>`;
}

function emptyState(msg) {
  return `<div class="empty-state">${msg}</div>`;
}

function errorState(msg, retryFn) {
  const isNoKey      = msg === 'NO_KEY';
  const isInvalidKey = msg === 'INVALID_KEY';

  const title = isInvalidKey
    ? 'Chave inválida'
    : isNoKey
    ? 'API Key necessária'
    : 'Erro ao carregar';

  const text = isInvalidKey
    ? 'Sua API Key parece inválida. Verifique em rapidapi.com.'
    : isNoKey
    ? 'Insira sua API Key no banner acima para carregar dados reais.'
    : `Não foi possível carregar os dados. (${msg})`;

  return `<div class="error-state">
    <div class="error-icon">${isNoKey || isInvalidKey ? '🔑' : '⚠️'}</div>
    <div class="error-title">${title}</div>
    <div class="error-msg">${text}</div>
    ${retryFn && !isNoKey ? `<button class="retry-btn" onclick="${retryFn}()">Tentar novamente</button>` : ''}
  </div>`;
}

// ── INIT ───────────────────────────────────────────────────
document.getElementById('current-season').textContent = STATE.season;
document.getElementById('scorers-season').textContent  = STATE.season;
checkApiKey();