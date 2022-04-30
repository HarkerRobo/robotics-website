// Finds the sum of all the approved purchases within a given year.
//
// Usage: node getTotalpurchase.js <year> (--excludeOps)
//
// <year> correlates to the starting year; e.g. 2017 would get the purchases for the 2017-2018 school year
// @author David Melisso
// @version June 16, 2018
const Purchase = require("../models/purchase");
const MONTHS = {
    JANUARY: 0,
    FEBRUARY: 1,
    MARCH: 2,
    APRIL: 3,
    MAY: 4,
    JUNE: 5,
    JULY: 6,
    AUGUST: 7,
    SEPTEMBER: 8,
    OCTOBER: 9,
    NOVEMBER: 10,
    DECEMBER: 11,
};
const CUTOFF_MONTH = MONTHS.JANUARY;
const CUTOFF_DAY = 6;

let query = {};

function getCutoffDates(beginningYear) {
    return {
        beginningDate: new Date(beginningYear, CUTOFF_MONTH, CUTOFF_DAY),
        endDate: new Date(beginningYear + 1, CUTOFF_MONTH, CUTOFF_DAY),
    };
}

async function getTotal(year, excludeOps) {
    let query = { approval: 4 };

    if (excludeOps) query.subteam = { $ne: 3 };

    const { beginningDate, endDate } = getCutoffDates(year);

    query.createdAt = {
        $gte: beginningDate,
        $lt: endDate,
    };

    const purchases = await Purchase.find(query);
    let total = 0;
    for (const purchase of purchases) {
        total += purchase.totalCost();
    }
    return total;
}

function getDefaultYear(attempt) {
    attempt = parseInt(attempt);
    if (!isNaN(attempt) && attempt > 1970 && attempt < 3000) return attempt;
    const thisYear = new Date().getFullYear();
    const { beginningDate } = getCutoffDates(thisYear);
    if (beginningDate > new Date()) return thisYear - 1;
    return thisYear;
}

async function main() {
    const beginningYear = getDefaultYear(process.argv[2]);
    const excludeOps = process.argv.includes("--excludeOps");
    const total = await getTotal(beginningYear, excludeOps);
    const { beginningDate, endDate } = getCutoffDates(beginningYear);
    console.log();
    console.log(
        `Total recorded purchase amount between ${beginningDate.toLocaleDateString()} and ${endDate.toLocaleDateString()} (${
            excludeOps ? "excluding" : "including"
        } Ops purchases):`
    );
    console.log(`$${total.toFixed(2)}`);
    process.exit();
}

if (require.main === module) {
    main();
}
module.exports = getTotal;
