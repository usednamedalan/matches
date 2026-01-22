const key = 'da384c1dbf880f63dd8e398cbb3d6471';
const apiBase = 'https://v3.football.api-sports.io';
const headers = { 'x-apisports-key': key };

function U() {
    const dateInp = document.getElementById('dtInp').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInp)) {
        alert("Enter date as YYYY-MM-DD");
        return;
    }
    G(dateInp);
}

function G(dateStr) {
    const container = document.getElementById('m-box');
    container.innerHTML = '<div class="loading">Fetching Matches...</div>';

    fetch(`${apiBase}/fixtures?date=${dateStr}`, { headers })
        .then(r => r.json())
        .then(res => {
            const matches = res.response;
            const topLeagues = [39, 140, 78, 135, 61, 2, 94, 88, 71, 253];
            
            const filtered = matches.filter(m => topLeagues.includes(m.league.id));

            if (filtered.length === 0) {
                container.innerHTML = ""; 
                return;
            }

            let html = "";
            filtered.forEach(m => {
                const status = m.fixture.status.short;
                const isLive = ["1H", "HT", "2H", "ET", "P"].includes(status);
                const scoreStyle = isLive ? 'style="color: #00d632;"' : '';

                html += `
                <div class="box" onclick="E(${m.fixture.id})">
                    <div style="text-align:center; font-size:10px; color:#888; margin-bottom:5px;">
                        ${m.league.name} • ${status}
                    </div>
                    <div class="row">
                        <div class="tm home">${m.teams.home.name} <img src="${m.teams.home.logo}"></div>
                        <div class="sc" ${scoreStyle}>
                            ${m.goals.home ?? 0}:${m.goals.away ?? 0}
                        </div>
                        <div class="tm away"><img src="${m.teams.away.logo}"> ${m.teams.away.name}</div>
                    </div>
                    <div class="ev" id="e${m.fixture.id}"></div>
                </div>`;
            });
            container.innerHTML = html;
        })
        .catch(() => container.innerHTML = "Error loading data.");
}

function E(fixtureId) {
    const eDiv = document.getElementById('e' + fixtureId);
    
    if (eDiv.style.display === 'block') {
        eDiv.style.display = 'none';
        return;
    }

    eDiv.innerHTML = "Loading scores...";
    eDiv.style.display = 'block';

    fetch(`${apiBase}/fixtures?id=${fixtureId}`, { headers })
        .then(r => r.json())
        .then(res => {
            const fixtureData = res.response[0];
            const homeId = fixtureData.teams.home.id;

            fetch(`${apiBase}/fixtures/events?fixture=${fixtureId}`, { headers })
                .then(r => r.json())
                .then(eventRes => {
                    const events = eventRes.response;
                    let homeHTML = "";
                    let awayHTML = "";

                    events.forEach(ev => {
                        if (ev.type === "Goal") {
                            const time = ev.time.elapsed + (ev.time.extra ? `+${ev.time.extra}` : "");
                            const player = ev.player.name || "Unknown";
                            const assist = ev.assist.name ? `<br><small style="color:#999">ast: ${ev.assist.name}</small>` : "";
                            const og = ev.detail === "Own Goal" ? " <span style='color:red'>[OG]</span>" : "";
                            
                            const goalLine = `<div class="ev-item"><strong>${time}'</strong> ${player}${og}${assist}</div>`;
                            if (ev.team.id === homeId) {
                                homeHTML += goalLine;
                            } else {
                                awayHTML += goalLine;
                            }
                        }
                    });

                    eDiv.innerHTML = `
                        <div class="ev-grid">
                            <div class="ev-home">${homeHTML || "--"}</div>
                            <div class="ev-away">${awayHTML || "--"}</div>
                        </div>`;
                });
        });
}
