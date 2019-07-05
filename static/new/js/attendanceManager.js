let lastFetchedDate;

function fetchEntries(lastFetchedDate) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `attendanceEntries?count=50&date=${(lastFetchedDate ? lastFetchedDate : new Date(Date.now() + 10000000000)).toISOString().split("T")[0]}`, true);
    xhr.onload = function() {
        const entries = JSON.parse(xhr.responseText);
        if(entries.error) {
            console.log("Error when fetching attendance entries")
            console.error(entries.error);
            return;
        }

        const keys = Object.keys(entries);
        keys.forEach((key, index) => {
            if(index == keys.length - 1) 
                lastFetchedDate = new Date(key);
            
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("attendance-day-wrapper");
            
            const dayDay = new Date(Date.parse(key));
            let html = '<div class="attendance-day-title-text">' +
'    <p class="attendance-day-date-text">' + convertDateToWeekdayAndDate(dayDay) + '</p> ' +
'    <p class="attendance-day-members-text">Members: ' + entries[key].length + '</p> ' +
'</div>';
            entries[key].forEach((entry) => {
                const checkIn = new Date(Date.parse(entry.checkIn));
                const checkOut = Date.parse(entry.checkOut) ? new Date(Date.parse(entry.checkOut)) : null;
                html += '<div class="attendance-entries">'+
'    <div class="attendance-entry">'+
'        <div class="attendance-name">'+
'            <p>' + entry.email.slice(0, -20) + '</p>'+
'        </div>'+
'        <div class="attendance-hours">'+
'            <p>' + convertHours(checkIn, checkOut) + ' (' + convertDateToTime(checkIn) + ' - ' + convertDateToTime(checkOut) + ')</p>'+
'        </div>'+
'        <div class="attendance-rating">'+
'            <img class="rating-icon" src="/new/img/svg/outline-thumb_up-24px.svg" />'+
'            <img class="rating-icon" src="/new/img/svg/outline-change_history-24px.svg" />'+
'            <img class="rating-icon" src="/new/img/svg/outline-thumb_down-24px.svg" />'+
'        </div>'+
'    </div>'+
'</div>'
            });
            dayDiv.innerHTML = html;
            document.getElementById("big-wrapper").appendChild(dayDiv);
        });
    }
    xhr.send();
}

fetchEntries();

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