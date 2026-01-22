const content = document.getElementById("content");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");

const leagues = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" }
];

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function clearUI() {
  errorBox.classList.add("hidden");
  content.innerHTML = "";
}

async function loadMatches() {
  clearUI();
  showLoader(true);

  try {
    const { from, to } = getDateRange();
    for (const league of leagues) {
      const fixtures = await apiFetch(
        `fixtures?league=${league.id}&season=2025&from=${from}&to=${to}`
      );

      if (!fixtures.length) continue;

      content.innerHTML += `<h3>${league.name}</h3>`;

      fixtures.forEach(f => {
        const live = f.fixture.status.short === "LIVE";
        content.innerHTML += `
          <div class="match">
            <div class="teams">
              <div class="team">
                <img src="${f.teams.home.logo}">
                ${f.teams.home.name}
              </div>

              <div class="score ${live ? "live" : ""}">
                ${f.goals.home ?? "-"} : ${f.goals.away ?? "-"}
                ${live ? "LIVE" : ""}
              </div>

              <div class="team">
                ${f.teams.away.name}
                <img src="${f.teams.away.logo}">
              </div>
            </div>
          </div>`;
      });
    }
  } catch {
    showError("Failed to load matches. API limit or network issue.");
  }

  showLoader(false);
}

async function loadLive() {
  clearUI();
  showLoader(true);

  try {
    const live = await apiFetch("fixtures?live=all");
    if (!live.length) {
      content.innerHTML = "<p>No live matches</p>";
    }

    live.forEach(f => {
      content.innerHTML += `
        <div class="match">
          <div class="teams">
            <div class="team">
              <img src="${f.teams.home.logo}">
              ${f.teams.home.name}
            </div>
            <div class="score live">
              ${f.goals.home} : ${f.goals.away} LIVE
            </div>
            <div class="team">
              ${f.teams.away.name}
              <img src="${f.teams.away.logo}">
            </div>
          </div>
        </div>`;
    });
  } catch {
    showError("Live matches unavailable.");
  }

  showLoader(false);
}

document.querySelectorAll("[data-page]").forEach(btn => {
  btn.onclick = () => {
    const page = btn.dataset.page;
    if (page === "matches") loadMatches();
    if (page === "live") loadLive();
  };
});

/* THEME */
const toggle = document.getElementById("themeToggle");
toggle.checked = localStorage.theme === "light";
document.body.classList.toggle("light", toggle.checked);

toggle.onchange = () => {
  document.body.classList.toggle("light", toggle.checked);
  localStorage.theme = toggle.checked ? "light" : "dark";
};

/* AUTO LOAD */
loadMatches();
setInterval(loadLive, 30000);
