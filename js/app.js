import { apiFetch, getDateRange } from "./api.js";

const content = document.getElementById("content");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const teamInput = document.getElementById("teamSearch");

const ALLOWED_LEAGUES = [39, 140, 78, 135, 61]; // Prem, La Liga, Bundesliga, Serie A, Ligue 1

function showLoader(show) { loader.classList.toggle("hidden", !show); }
function showError(msg) { errorBox.textContent = msg; errorBox.classList.remove("hidden"); }
function clearUI() { errorBox.classList.add("hidden"); content.innerHTML = ""; }

function renderFixture(f) {
  content.innerHTML += `
    <div class="match">
      <div class="teams">
        <div class="team">
          <img src="${f.teams.home.logo}">
          ${f.teams.home.name}
        </div>
        <div class="score ${f.fixture.status.short === "LIVE" ? "live" : ""}">
          ${f.goals.home ?? "-"} : ${f.goals.away ?? "-"} ${f.fixture.status.short === "LIVE" ? "LIVE" : ""}
        </div>
        <div class="team">
          ${f.teams.away.name}
          <img src="${f.teams.away.logo}">
        </div>
      </div>
    </div>
  `;
}

// LOAD MATCHES
async function loadMatches() {
  clearUI();
  showLoader(true);
  try {
    const { from, to } = getDateRange();
    for (const league of ALLOWED_LEAGUES) {
      const fixtures = await apiFetch(`fixtures?league=${league}&season=2025&from=${from}&to=${to}`);
      if (!fixtures.length) continue;
      content.innerHTML += `<h3>League ${league}</h3>`;
      fixtures.forEach(renderFixture);
    }
  } catch { showError("Failed to load matches."); }
  showLoader(false);
}

// TEAM SEARCH
teamInput.addEventListener("keydown", async e => {
  if (e.key !== "Enter") return;
  const query = teamInput.value.trim();
  if (!query) return;
  await loadTeamPage(query);
});

async function loadTeamPage(teamName) {
  clearUI();
  showLoader(true);
  try {
    const teamRes = await apiFetch(`teams?search=${encodeURIComponent(teamName)}`);
    const team = teamRes[0]?.team;
    if (!team) throw new Error("Team not found");
    content.innerHTML = `<h2>${team.name}</h2><img src="${team.logo}" width="60"><div id="teamData"></div>`;

    const fixtures = await apiFetch(`fixtures?team=${team.id}&season=2025`);
    const upcoming = fixtures.filter(f => f.fixture.status.short === "NS").slice(0,5);
    const past = fixtures.filter(f => f.fixture.status.short === "FT").slice(-5);

    content.innerHTML += `<h3>Upcoming</h3>`; upcoming.forEach(renderFixture);
    content.innerHTML += `<h3>Last 5</h3>`; past.forEach(renderFixture);

  } catch { showError("Team not found."); }
  showLoader(false);
}

// THEME
const toggle = document.getElementById("themeToggle");
toggle.checked = localStorage.theme === "light";
document.body.classList.toggle("light", toggle.checked);
toggle.onchange = () => {
  document.body.classList.toggle("light", toggle.checked);
  localStorage.theme = toggle.checked ? "light" : "dark";
};

// PAGE LOAD
loadMatches();
