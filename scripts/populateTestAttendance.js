const Entry = require("../models/attendanceEntry");

(async function () {
    let totalEntries = 200;

    console.log(`Generating ${totalEntries} Entries`);
    while (totalEntries--) {
        await Entry.create({
            email:
                Math.random().toString(36).substring(2) +
                "@students.harker.org",
            checkIn: getToday().getTime() + 54000000 + Math.random() * 7200000, //+ new Date().getTimezoneOffset() * -60 * 1000,
            checkOut: null, //getToday().getTime() + (54000000 + 7200000) + Math.random() * 7200000 ,//+ new Date().getTimezoneOffset() * -60 * 1000,
        });
    }
    console.log("Done");
})();

function getToday() {
    return new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDay() - parseInt(Math.random() * 5)
    );
}
