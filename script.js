const API_KEY = '54SxQNR5EHjCMTWe';
// Note: Live-score API usually requires a "secret" as well. 
// If your plan is Key-only, just use the key.
const API_SECRET = 'EU606jiKxvOfaCGfHyMxlEC0mWD8Qznu'; 

async function getMatches() {
    const date = document.getElementById('dateInput').value;
    const container = document.getElementById('matches-container');
    
    // Live-score API Date format usually matches YYYY-MM-DD
    const url = `https://livescore-api.com/api-client/fixtures/matches.json?key=${API_KEY}&secret=${API_SECRET}&date=${date}`;

    container.innerHTML = "Loading games...";

    try {
        const res = await fetch(url);
        const data = await res.json();
        const matches = data.data.fixtures; // Live-score API nests under data.fixtures

        container.innerHTML = matches.map(m => `
            <div class="match-card" onclick="getEvents(${m.id})">
                <div class="league-info">${m.competition_name}</div>
                <div class="row">
                    <div class="team home">${m.home_name}</div>
                    <div class="score-box">
                        ${m.score || 'vs'}
                        <span class="status-tag">${m.status}</span>
                    </div>
                    <div class="team away">${m.away_name}</div>
                </div>
                <div class="events-area" id="events-${m.id}"></div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = "Error fetching data.";
    }
}

async function getEvents(matchId) {
    const panel = document.getElementById(`events-${matchId}`);
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    panel.innerHTML = "Loading scorers...";

    const url = `https://livescore-api.com/api-client/scores/events.json?key=${API_KEY}&secret=${API_SECRET}&id=${matchId}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const events = data.data.event;

        let homeHtml = "";
        let awayHtml = "";

        events.forEach(ev => {
            if (ev.event === "GOAL") {
                const line = `<div class="goal-item"><strong>${ev.time}'</strong> ${ev.player}</div>`;
                // Live-score API identifies team via home_away field (usually 'home' or 'away')
                if (ev.home_away === "home") homeHtml += line;
                else awayHtml += line;
            }
        });

        panel.innerHTML = `
            <div class="events-grid">
                <div class="ev-home">${homeHtml || "--"}</div>
                <div class="ev-away">${awayHtml || "--"}</div>
            </div>
        `;
    } catch (e) {
        panel.innerHTML = "Details unavailable.";
    }
}
