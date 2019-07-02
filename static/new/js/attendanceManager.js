let lastFetchedDate;

function fetchEntries(lastFetchedDate) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `attendanceEntries?count=50&date=${(lastFetchedDate ? lastFetchedDate : new Date(Date.now() + 1000000)).toISOString().split("T")[0]}`, true);
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
            
            let html = `<h1>${key}</h1>`;
            entries[key].forEach((entry) => {
                html += `<b>${entry.email}</b> checked in at <b>${entry.checkIn}</b><br />`;
            });
            dayDiv.innerHTML = html;
            document.body.appendChild(dayDiv);
        });
    }
    xhr.send();
}

fetchEntries();