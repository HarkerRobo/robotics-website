let lastFetchedDate;
let fetched = false;

function fetchEntries() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/member/attendance/attendanceEntries?${typeof username !== "undefined" ? `username=${username}&` : ""}count=50&date=${(lastFetchedDate != undefined ? lastFetchedDate : new Date(Date.now() + 10000000000)).toISOString().split("T")[0]}`, true);
    xhr.onload = function() {
        const entries = JSON.parse(xhr.responseText);
        if(entries.error) {
            console.log("Error when fetching attendance entries")
            console.error(entries.error);
            return;
        }

        const keys = Object.keys(entries);
        keys.forEach((key, index) => {
            console.log(key);
            console.log(new Date(key));
            if(index == keys.length - 1) 
                lastFetchedDate = new Date(key);
            console.log(lastFetchedDate);
            
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("attendance-day-wrapper");
            
            const dayDay = new Date(Date.parse(key));
            let html = '<div class="attendance-day-title-text">' +
'    <p class="attendance-day-date-text">' + convertDateToWeekdayAndDate(dayDay) + '</p> ' +
'    <p class="attendance-day-members-text">Members: ' + entries[key].length + '</p> ' +
'</div>';
            entries[key].forEach((entry) => {
                const review = entry.review;
                const checkIn = new Date(Date.parse(entry.checkIn));
                const checkOut = Date.parse(entry.checkOut) ? new Date(Date.parse(entry.checkOut)) : null;
                html += '<div class="attendance-entries">'+
'    <div class="attendance-entry" id="' + entry.id + '">'+
'        <div class="attendance-name">'+
'            <a class="no-style-a" href="attendance/' + entry.email.slice(0, -20) + '"><p>' + entry.email.slice(0, -20) + '</p></a>'+
'        </div>'+
'        <div class="attendance-hours">'+
'            <p>' + convertHours(checkIn, checkOut) + ' (' + convertDateToTime(checkIn) + ' - ' + convertDateToTime(checkOut) + ')</p>'+
'        </div>'+
'        <div class="attendance-rating">'+
'            <button class="thumbsUp"><img class="rating-icon" src="/new/img/svg/' + (review == 1 ? "baseline" : "outline") + '-thumb_up-24px.svg" /></button>'+
'            <button class="meh"><img class="rating-icon" src="/new/img/svg/' + (review == 0 ? "baseline" : "outline") + '-change_history-24px.svg" /></button>'+
'            <button class="thumbsDown"><img class="rating-icon" src="/new/img/svg/' + (review == -1 ? "baseline" : "outline") + '-thumb_down-24px.svg" /></button>'+
'        </div>'+
'    </div>'+
'</div>'
            });
            dayDiv.innerHTML = html;
            document.getElementById("big-wrapper").appendChild(dayDiv);
        });
        setTimeout(initializeRatingEventListeners, 0);
        fetched = keys.length > 0;
    }
    xhr.send();
}

fetchEntries();

function initializeRatingEventListeners() {
    Array.from(document.getElementsByClassName("thumbsUp")).forEach(function(button) {
        button.onclick = function() {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "review", true);
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.onload = function() {
                const resp = JSON.parse(xhr.responseText);
                if(resp.error) {
                    console.error(resp.error);
                } else {
                    disableAll(button);
                    if(resp.success == "reviewed") {
                        setClicked(button.firstChild);
                    }
                }
            }
            xhr.send(JSON.stringify({
                id: button.parentElement.parentElement.id,
                rating: 1
            }));
        }
    });
    Array.from(document.getElementsByClassName("meh")).forEach(function(button) {
        button.onclick = function() {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "review", true);
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.onload = function() {
                const resp = JSON.parse(xhr.responseText);
                if(resp.error) {
                    console.error(resp.error);
                } else {
                    disableAll(button);
                    if(resp.success == "reviewed") {
                        setClicked(button.firstChild);
                    }
                }
            }
            xhr.send(JSON.stringify({
                id: button.parentElement.parentElement.id,
                rating: 0
            }));
        }
    });
    Array.from(document.getElementsByClassName("thumbsDown")).forEach(function(button) {
        button.onclick = function() {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "review", true);
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.onload = function() {
                const resp = JSON.parse(xhr.responseText);
                if(resp.error) {
                    console.error(resp.error);
                } else {
                    disableAll(button);
                    if(resp.success == "reviewed") {
                        setClicked(button.firstChild);
                    }
                }
            }
            xhr.send(JSON.stringify({
                id: button.parentElement.parentElement.id,
                rating: -1
            }));
        }
    });
}

function disableAll(button) {
    Array.from(button.parentElement.children).forEach(function(button) {
        setUnclicked(button.firstChild);
    });
}

function toggleSrc(img) {
    if(img.src.indexOf("baseline") == -1) {
        setClicked(img)
    } else {
        setUnclicked(img);
    }
}

function setClicked(img) {
    img.src = img.src.replace("outline", "baseline");
}

function setUnclicked(img) {
    img.src = img.src.replace("baseline", "outline");
}

function convertDateToWeekdayAndDate(date) {
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return weekDays[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();
}

function convertDateToTime(date) {
    if(!date) {
        return '<span class="red">????</span>';
    }
    return (date.getHours() % 12) + ":" + (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
}

function calculateHours(checkIn, checkOut) {
    if(checkIn == null || checkOut == null) return 0;
    return ((checkOut - checkIn) / 1000 / 60 / 60).toFixed(1);
}

function convertHours(checkIn, checkOut) {
    const hours = calculateHours(checkIn, checkOut);
    if(!hours)
        return '<span class="red">0 Hours</span>';
    if(!(hours - 1))
        return "1 Hour";
    else
        return hours + " Hours";
}


document.addEventListener("scroll", function() {
    if(fetched && (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) { //https://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
        setTimeout(function() {
            fetched = false;
            fetchEntries(lastFetchedDate);
        }, 1000); //throttle entry fetching to prevent rapid scrolling
    }
});