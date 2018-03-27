// https://stackoverflow.com/questions/44709114/javascript-screen-orientation-on-safari
var mql = window.matchMedia("(orientation: portrait)");
if(mql.matches) { /* Portrait orientation */ }
else { /* Landscape orientation */ }
mql.addListener(function(m) {
    if(m.matches) { /* Changed to portrait */ }
    else { /* Changed to landscape */ }
})

let autonActions = []
let teleopActions = []
let undoStack = []

class NiceError extends Error {
    constructor(message) {
        super(message)
    }
}

function sleep(duration) {
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, duration)
    });
};

async function initiate(selector, time) {
    var el = document.querySelectorAll(selector);
    var time_to_start = time || 200
    await sleep(time_to_start)
    /*var time_online = 80
    var time_offline = 100
    el.forEach(e => e.classList.remove('active'))

    el.forEach(e => e.classList.add('active'))
    await sleep(time_offline)
    el.forEach(e => e.classList.remove('active'))
    await sleep(time_online)*/
    el.forEach(e => e.classList.add('active'))
};

async function initiateSlide(selector) {
    var el = document.querySelectorAll(selector);
    //el.forEach(e => e.classList.remove('active'))

    el.forEach(e => e.classList.add('active'))
    el.forEach(e => e.classList.remove('no-width'))
    await sleep(500)
    el.forEach(e => e.classList.remove('no-height'))
    //el.forEach(e => e.classList.remove('slide-before'))
    await sleep(500)
};

async function cfetch(url, options) {
    options = options || {}
    options.credentials = 'same-origin'
    const res = await fetch(url, options)
    const text = await res.text()
    try {
        return JSON.parse(text)
    } catch (e) {
        if (res.status == 200) return true;
        throw new NiceError(text.match('<p>(.*?)</p>')[1].replace(/<\/?strong>/g, ''))
    }
}

async function enter(match) {
    document.getElementById('prompt').style.display = 'none'
    document.getElementById('main').style.display = 'block'
    console.log(match)
    const json = await cfetch(`/member/scouting/request/${match}`);
    const TOURN_ID = json.tournament.id
    const RANK = json.scouting.rank
    const ROUND = json.scouting.round
    const BLUE = json.scouting.blue
    const TEAM = json.scouting.team

    document.getElementById('match').innerHTML = 'Match ' + match
    document.getElementById('team').innerHTML = 'Team ' + TEAM

    document.getElementById('autonslider').classList.add(BLUE ? 'blue' : 'red')

    await sleep(100);
    //await initiate('#scouting')

    await initiateSlide('#scouting');
    //await initiate('#scouting', 0);
    //await initiate('#field', 0);
    await initiate('.work-area',0);
    await initiate('.loading-area',0);
    await initiate('.switch');
    await initiate('#scale');

    document.getElementById('go').addEventListener('click', () => {
        let start_position = document.getElementById('autonslider').value
        if (!BLUE) start_position *= -1
        let time = 15;
        let auton = true;
        document.getElementById('autonslider').style.display = 'none'
        document.getElementById('go').style.display = 'none'
        document.getElementById('undo').style.display = 'block'
        setInterval(() => {
            time -= 1;
            if (time == 0) {
                if (auton) {
                    auton = false;
                    time = 135;
                } else {
                    finalize({
                        headers: {
                            rank: RANK,
                            blue: BLUE,
                            team: TEAM,
                            round: ROUND,
                            tournament_id: TOURN_ID,
                            forceUpload: false
                        }, data: {
                            web: true,
                            start_position: start_position,
                        }
                    });
                    return;
                }
            }
            let seconds = String(time%60);
            if (seconds.length == 1) seconds = '0' + seconds;
            document.getElementById('clock').innerHTML = `${Math.floor(time/60)}:${seconds}`
        }, 1000)

        function clicky(id, action) {
            document.getElementById(id).addEventListener('click', function() {
                const arr = (auton ? autonActions : teleopActions)
                item = {
                    timestamp: Date.now(), action
                }
                arr.push(item)
                const counter = this.querySelector('.counter')
                counter.innerHTML = Number(counter.innerHTML) + 1
                undoStack.push({ arr, item, counter })
            })
        }

        clicky('scale', '0_0_1')
        clicky('red-switch', BLUE ? '0_0_2' : '0_0_0')
        clicky('blue-switch', BLUE ? '0_0_0' : '0_0_2')
        clicky('red-loading-area', '0_0_3')
        clicky('blue-loading-area', '0_0_3')
    })
}

document.getElementById('undo').addEventListener('click', () => {
    const lastUndo = undoStack.pop()
    lastUndo.arr.splice(lastUndo.arr.indexOf(lastUndo.item), 1)
    lastUndo.counter.innerHTML = Number(lastUndo.counter.innerHTML) - 1
})

function finalize(data) {
    document.getElementById('main').style.display = 'none'
    document.getElementById('final').style.display = 'block'


    document.getElementById('formsub').addEventListener('click', (e) => {
        e.preventDefault();
        var crossed = JSON.parse(document.querySelector('input[name="crossedline"]:checked').value)
        var endedplat = JSON.parse(document.querySelector('input[name="endedplat"]:checked').value)
        var lifted = JSON.parse(document.querySelector('input[name="lifted"]:checked').value)
        data.data.crossed_line = crossed
        data.data.end_platform = endedplat
        data.data.lift = lifted
        data.data['auton-actions'] = autonActions
        data.data['teleop-actions'] = teleopActions
        data.data.comments = document.getElementById('comments').value
        cfetch('/member/scouting/upload', {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST'
        }).then(() => {
            window.location.reload()
        }, (e) => {
            console.error(e)
            alert((e instanceof NiceError) ? e.message : 'Scouting API Error! Yay!')
        })
    })
}

document.getElementById('promptsub').addEventListener('click', () => {
    enter(Number(document.getElementById('promptel').value))
    .catch((e) => {
        console.error(e)
        alert((e instanceof NiceError) ? e.message : 'Scouting API Error! Yay!')
    })
})
