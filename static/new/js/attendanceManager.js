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
            let html = `<h1>${dayDay.getMonth() + 1}/${dayDay.getDate()}</h1>`;
            entries[key].forEach((entry) => {
                const checkIn = new Date(Date.parse(entry.checkIn));
                html += `<b>${entry.email}</b> checked in at <b>${checkIn.getHours()}:${checkIn.getMinutes()}</b><br />`;
            });
            dayDiv.innerHTML = html;
            document.body.appendChild(dayDiv);
        });
    }
    xhr.send();
}

fetchEntries();