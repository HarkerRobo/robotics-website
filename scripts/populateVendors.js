const Vendor = require("../models/vendor");

let vendorData = [
    [
        "Andymark",
        "877-868-4770",
        "sales@andymark.com",
        "2311 N. Washington St., Kokomo, IN 46901",
    ],
    [
        "Vex Pro",
        "903-453-0802",
        "sales@vexrobotics.com",
        "1519 Interstate 30, West Greenville, TX 75402",
    ],
    ["Amazon", "(888) 280-3321", "", "4625 Albany Drive, San Jose, CA 95129"],
    [
        "SDP/SI",
        "800-819-8900",
        "SDP-SIsupport@sdp-si.com",
        "2101 Jericho Turnpike, Box 5416, New Hyde Park, New York 11042-5416",
    ],
    [
        "McMaster-Carr",
        "(562) 692-5911",
        "la.sales@mcmaster.com",
        "P.O. Box 54960, Los Angeles, CA 90054-0960",
    ],
    [
        "West Coast Products",
        "323-989-2718",
        "sales@wcproducts.net",
        "2214 Driftwood Drive, Madera, CA 93637",
    ],
    [
        "Little Machine Stop",
        "(800) 981-9663",
        "info@littlemachineshop.com",
        "396 W. Washington Blvd. #500 Pasadena, CA 91103",
    ],
    [
        "MariTool",
        "888 352 7773",
        "info@maritool.com",
        "242 Beinoris Drive Wood Dale, IL 60191 United States",
    ],
];

(async function () {
    console.log(`Creating ${vendorData.length} premade vendors:`);
    console.log(vendorData.map((data) => data[0]).join(", "));
    const vendorCreatePromises = vendorData.map((data) =>
        Vendor.create({
            name: data[0],
            phone: data[1],
            email: data[2],
            address: data[3],
        })
    );

    Promise.all(vendorCreatePromises).then(() => {
        console.log("Done");
    });
})();
