var myKey = '32a94097e144fbded05a2537984eb315';
var myDate = new Date();

function update() {
    var y = myDate.getFullYear();
    var m = myDate.getMonth() + 1;
    var d = myDate.getDate();

    if (m < 10) m = '0' + m;
    if (d < 10) d = '0' + d;

    var format = y + '-' + m + '-' + d;
    document.getElementById('fullDate').innerHTML = format;
    
    getMatches(format);
}

function goBack() {
    myDate.setDate(myDate.getDate() - 1);
    document.getElementById('dayText').innerHTML = "Previous";
    update();
}

function goForward() {
    myDate.setDate(myDate.getDate() + 1);
    document.getElementById('dayText').innerHTML = "Future";
    update();
}

function getMatches(dateString) {
    var box = document.getElementById('matches-container');
    box.innerHTML = "Loading matches...";

    fetch('https://v3.football.api-sports.io/fixtures?date=' + dateString, {
        headers: { 'x-apisports-key': myKey }
    })
    .then(res => res.json())
    .then(data => {
        var list = data.response;
        var html = "";

        var topLeagues = [39, 140, 78, 135, 61, 2];

        for (var i = 0; i < list.length; i++) {
            var m = list[i];
            
            if (topLeagues.includes(m.league.id)) {
                html += '<div class="match-box" onclick="getEvents(' + m.fixture.id + ')">';
                html += '<div class="main-row">';
                html += '<div class="team" style="justify-content: flex-end">' + m.teams.home.name + ' <img src="' + m.teams.home.logo + '"></div>';
                html += '<div class="score">' + (m.goals.home ?? 0) + ' - ' + (m.goals.away ?? 0) + '</div>';
                html += '<div class="team"><img src="' + m.teams.away.logo + '"> ' + m.teams.away.name + '</div>';
                html += '</div>';
                html += '<div class="scorers" id="s-' + m.fixture.id + '"></div>';
                html += '</div>';
            }
        }
        
        if (html == "") html = "No matches found for top leagues.";
        box.innerHTML = html;
    });
}

function getEvents(id) {
    var sBox = document.getElementById('s-' + id);
    
    if (sBox.classList.contains('active')) {
        sBox.classList.remove('active');
        return;
    }

    sBox.innerHTML = "Loading scorers...";
    sBox.classList.add('active');

    fetch('https://v3.football.api-sports.io/fixtures/events?fixture=' + id, {
        headers: { 'x-apisports-key': myKey }
    })
    .then(res => res.json())
    .then(data => {
        var ev = data.response;
        var goalList = "";
        for (var j = 0; j < ev.length; j++) {
            if (ev[j].type == "Goal") {
                goalList += "Goal: " + ev[j].player.name + " (" + ev[j].time.elapsed + "') Assist: " + (ev[j].assist.name ?? "None") + "<br>";
            }
        }
        if (goalList == "") goalList = "No goals.";
        sBox.innerHTML = goalList;
    });
}

update();
