const a = '54SxQNR5EHjCMTWe';
const b = 'EU606jiKxvOfaCGfHyMxlEC0mWD8Qznu';

const c = [
    'Premier League',
    'La Liga',
    'Serie A',
    'Bundesliga',
    'Ligue 1'
];

async function getMatches() {
    const d = document.getElementById('dateInput').value;
    const e = document.getElementById('matches-container');

    const f = `https://livescore-api.com/api-client/fixtures/matches.json?key=${a}&secret=${b}&date=${d}`;

    e.innerHTML = '<div style="text-align:center">Loading...</div>';

    try {
        const g = await fetch(f);
        const h = await g.json();
        if (!h.success) { e.innerHTML = ''; return; }

        const i = h.data.fixtures.filter(j => c.includes(j.competition_name));

        e.innerHTML = i.map(j => {
            const k = j.status === 'LIVE' || j.status === 'IN PLAY';
            const l = j.score ? j.score : (j.time ? j.time.substring(0,5) : 'VS');

            return `
            <div class="match-card" onclick="toggleEvents(${j.id})">
                <div class="league-name">${j.competition_name}</div>
                <div class="row">
                    <div class="team home">${j.home_name}</div>
                    <div class="score-box">
                        <div style="${k ? 'color:var(--accent)' : ''}">${l}</div>
                        ${k ? `<div class="live-mark"><span class="red-dot"></span> LIVE</div>` : ''}
                    </div>
                    <div class="team away">${j.away_name}</div>
                </div>
                <div class="events-panel" id="events-${j.id}"></div>
            </div>`;
        }).join('');
    } catch {
        e.innerHTML = '';
    }
}

async function toggleEvents(a1) {
    const b1 = document.getElementById(`events-${a1}`);
    if (b1.style.display === 'block') { b1.style.display = 'none'; return; }

    b1.style.display = 'block';
    b1.innerHTML = 'Loading';

    const c1 = `https://livescore-api.com/api-client/scores/events.json?key=${a}&secret=${b}&id=${a1}`;

    try {
        const d1 = await fetch(c1);
        const e1 = await d1.json();
        const f1 = e1.data.event || [];

        let g1 = '', h1 = '';

        f1.forEach(i1 => {
            if (i1.event === 'GOAL') {
                const j1 = `<div class="ev-item"><strong>${i1.time}'</strong> ${i1.player}</div>`;
                if (i1.home_away === 'home') g1 += j1;
                else h1 += j1;
            }
        });

        b1.innerHTML = `
        <div class="events-grid">
            <div class="ev-home">${g1 || '--'}</div>
            <div class="ev-away">${h1 || '--'}</div>
        </div>`;
    } catch {
        b1.innerHTML = '--';
    }
}
