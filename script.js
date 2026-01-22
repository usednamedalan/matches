const API_KEY = '54SxQNR5EHjCMTWe';
const API_SECRET = 'EU606jiKxvOfaCGfHyMxlEC0mWD8Qznu'; // MUST add your secret from live-score-api.com

async function getMatches() {
    const date = document.getElementById('dateInput').value;
    const container = document.getElementById('matches-container');
    
    // Live-score API endpoint for fixtures
    const url = `https://livescore-api.com/api-client/fixtures/matches.json?key=${API_KEY}&secret=${API_SECRET}&date=${date}`;

    container.innerHTML = '<div style="text-align:center">Loading...</div>';

    try {
        const response = await fetch(url);
        const resData = await response.json();
        
        if (!resData.success) {
            container.innerHTML = `<div style="color:red">API Error: ${resData.error || 'Check your Secret Key'}</div>`;
            return;
        }

        const matches = resData.data.fixtures;

        container.innerHTML = matches.map(m => {
            const isLive = m.status === 'LIVE' || m.status === 'IN PLAY';
            const score = m.score ? m.score : (m.time ? m.time.substring(0,5) : 'VS');

            return `
            <div class="match-card" onclick="toggleEvents(${m.id})">
                <div class="league-name">${m.competition_name}</div>
                <div class="row">
                    <div class="team home">${m.home_name}</div>
                    <div class="score-box">
                        <div style="${isLive ? 'color:var(--accent)' : ''}">${score}</div>
                        ${isLive ? `<div class="live-mark"><span class="red-dot"></span> LIVE</div>` : ''}
                    </div>
                    <div class="team away">${m.away_name}</div>
                </div>
                <div class="events-panel" id="events-${m.id}"></div>
            </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = "Connection failed.";
    }
}

async function toggleEvents(matchId) {
    const panel = document.getElementById(`events-${matchId}`);
    if (panel.style.display === 'block') { panel.style.display = 'none'; return; }

    panel.style.display = 'block';
    panel.innerHTML = "Fetching goalscorers...";

    const url = `https://livescore-api.com/api-client/scores/events.json?key=${API_KEY}&secret=${API_SECRET}&id=${matchId}`;

    try {
        const response = await fetch(url);
        const resData = await response.json();
        const events = resData.data.event;

        let homeH = "", awayH = "";

        events.forEach(ev => {
            if (ev.event === "GOAL") {
                const line = `<div class="ev-item"><strong>${ev.time}'</strong> ${ev.player}</div>`;
                // Live-score API identifies team side by 'home' or 'away' string
                if (ev.home_away === "home") homeH += line;
                else awayH += line;
            }
        });

        panel.innerHTML = `
            <div class="events-grid">
                <div class="ev-home">${homeH || "--"}</div>
                <div class="ev-away">${awayH || "--"}</div>
            </div>`;
    } catch (e) {
        panel.innerHTML = "No goal data found.";
    }
}
