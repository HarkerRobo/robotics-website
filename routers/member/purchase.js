"use strict";

const express = require("express"),
    router = express.Router(),
    moment = require("moment"),
    compression = require("compression"),
    https = require("https"),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    config = require(__base + "config.json"),
    Purchase = require("../../models/purchase"),
    User = require("../../models/user"),
    Vendor = require("../../models/vendor"),
    xss = require("xss"),
    csrf = require("csurf"),
    csrfProtection = csrf({ cookie: true }),
    ranks = require("../../helpers/ranks.json"),
    auth = require("../../helpers/auth"),
    email = require("../../helpers/email");

const MENTOR_EMAIL = config.users.mentor;

const PURCHASE_FIELDS = {
    purchase_id: "Purchase ID",
    vendor: "Vendor",
    vendor_phone: "Vendor Phone",
    vendor_email: "Vendor Email",
    vendor_address: "Vendor Address",
    reason_for_purchase: "Reason For Purchase",
    part_url: "Part URL",
    part_number: "Part Number",
    part_name: "Part Name",
    subsystem: "Subsystem",
    price_per_unit: "Price Per Unit",
    quantity: "Quantity",
    shipping_and_handling: "Shipping and Handling",
    tax: "Tax",
    submitted_by: "Submitted By",
    admin_comments: "Admin Comments",
    admin_username: "Admin Username",
    mentor_comments: "Mentor Comments",
};

router.use(cookieParser());

const safeString = (str) => (typeof str === "undefined" ? "" : str);

const toNumber = (num, err) => {
    var res = parseInt(num, 10);
    return isNaN(res) ? err.toString() : res;
};

const mapToNumber = (arr, err) => {
    return Array.isArray(arr)
        ? arr.map((x) => {
              return toNumber(x, err);
          })
        : toNumber(arr, err);
};

const toDollarAmount = (num, err) => {
    var res = parseFloat(num, 10).toFixed(2);
    return res === "NaN" ? err.toString() : res;
};

const mapToDollarAmount = (arr, err) => {
    return Array.isArray(arr)
        ? arr.map((x) => {
              return toDollarAmount(x, err);
          })
        : toDollarAmount(arr, err);
};

const deleteBlanks = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (typeof arr[i] === "undefined" || arr[i] === null || arr[i] === "")
            arr.splice(i, 1);
    }
};

// must be pr_whitelisted to see below pages
router.all("/*", function (req, res, next) {
    if (req.auth.level >= ranks.pr_whitelist) {
        next();
    } else {
        res.render("pages/member/error", {
            statusCode: 401,
            error: "Must be whitelisted to use the Purchase Request system.",
        });
    }
});

/*router.get('/wiki', function (req, res) {
res.render('pages/member/wiki')
})*/

router.get("/", auth.verifyRank(ranks.pr_whitelist), async (req, res) => {
    res.redirect("list");
});

router.get(
    "/view/:purchase_id",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        try {
            const purchase = await Purchase.findOne({
                purchase_id: req.params.purchase_id,
            });
            if (purchase == null) throw new Error();
            const submitted_by = (
                (await User.findOne({
                    email: purchase.submitted_by,
                })) || { name: "Harker Robotics" }
            ).name;
            const email_link = `mailto:Eric.Nelson@harker.org?subject=Receipt for Reimbursement (PR #${purchase.purchase_id})&body=Hi Dr. Nelson,%0A%0AHere\\'s the receipt for reimbursement for PR #${purchase.purchase_id} (https://robotics.harker.org/member/purchase/view/${purchase.purchase_id}).%0A%0AThanks,%0A${req.auth.info.name}`;
            res.render("pages/member/purchase/view", {
                purchase: purchase,
                creation: purchase._id.getTimestamp().toDateString(),
                total: purchase.totalCost(),
                email_link: email_link,
            });
        } catch (err) {
            res.render("pages/member/error", {
                statusCode: 404,
                error: err ? err : "Purchase not found",
            });
        }
    }
);

router.get(
    "/list_object/:filter",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        let query = {};
        if (req.params.filter === "my")
            query = { submitted_by: req.auth.info.email };
        else if (req.params.filter === "admin")
            query = { $or: [{ approval: 0 }, { approval: 3 }] };
        else if (req.params.filter === "mentor") query = { approval: 2 };

        try {
            const purchases = await Purchase.find(query).sort({
                purchase_id: -1,
            });
            let map = [];
            purchases.forEach((e, i) => {
                map[i] = JSON.parse(JSON.stringify(e));
                map[i].total_cost = e.totalCost();
            });
            res.send(map);
        } catch (err) {
            res.status(500).json({ success: false, error: { message: err } });
        }
    }
);

router.get(
    "/list_object/",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        try {
            const purchases = await Purchase.find({}).sort({ purchase_id: -1 });
            let map = [];
            purchases.forEach((e, i) => {
                map[i] = JSON.parse(JSON.stringify(e));
                map[i].total_cost = e.totalCost();
            });
            res.send(map);
        } catch (err) {
            res.status(500).json({ success: false, error: { message: err } });
        }
    }
);

router.post(
    "/vendor",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        if (
            !(
                req.body.name &&
                req.body.email &&
                req.body.phone &&
                req.body.address
            )
        ) {
            res.status(401).end("Bad request");
        }
        await Vendor.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
        });
        res.status(200).end();
    }
);

router.get("/list/", auth.verifyRank(ranks.pr_whitelist), async (req, res) => {
    res.render("pages/member/purchase/list", {
        filter: "all",
        fields: PURCHASE_FIELDS,
    });
});

router.get(
    "/list_my",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        res.render("pages/member/purchase/list", {
            filter: "my",
            fields: PURCHASE_FIELDS,
        });
    }
);

router.get(
    "/create",
    csrfProtection,
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        let vendors = await Vendor.find();
        vendors = vendors.sort((vendor1, vendor2) =>
            vendor1.name > vendor2.name ? 1 : -1
        );
        res.render("pages/member/purchase/create", {
            csrfToken: req.csrfToken(),
            vendors: vendors,
        });
    }
);

const xss_array = function (arr) {
    let res = arr;
    if (typeof arr === "string") res = [res];

    for (let i = 0; i < res.length; i++) res[i] = xss(res[i]);

    return res;
};

router.post(
    "/create",
    csrfProtection,
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        if (
            req.body.part_url === "" &&
            req.body.part_number === "" &&
            req.body.part_name === "" &&
            req.body.subsystem === "" &&
            req.body.price_per_unit === "" &&
            req.body.quantity === ""
        ) {
            req.body.part_url =
                req.body.part_number =
                req.body.part_name =
                req.body.subsystem =
                req.body.quantity =
                    [];
        }
        if (
            req.body.part_url[0] === "" &&
            req.body.part_number[0] === "" &&
            req.body.part_name[0] === "" &&
            req.body.subsystem[0] === "" &&
            req.body.part_url[0] === "" &&
            !req.body.price_per_unit[0] &&
            !req.body.quantity[0]
        ) {
            req.body.part_url.shift();
            req.body.part_number.shift();
            req.body.part_name.shift();
            req.body.subsystem.shift();
            req.body.price_per_unit.shift();
            req.body.quantity.shift();
        }
        if (req.body.reason_for_purchase === "") {
            res.render("pages/member/error", {
                statusCode: 400,
                error: "Purchase reason missing",
            });
        }
        try {
            const purchase = await Purchase.create({
                subteam: xss(safeString(req.body.subteam)),
                vendor: xss(safeString(req.body.vendor)),
                vendor_phone: xss(safeString(req.body.vendor_phone)),
                vendor_email: xss(safeString(req.body.vendor_email)),
                vendor_address: xss(safeString(req.body.vendor_address)),
                reason_for_purchase: xss(
                    safeString(req.body.reason_for_purchase)
                ),
                part_url: xss_array(req.body.part_url),
                part_number: xss_array(req.body.part_number),
                part_name: xss_array(req.body.part_name),
                subsystem: xss_array(req.body.subsystem),
                price_per_unit: xss_array(
                    mapToDollarAmount(req.body.price_per_unit, 0)
                ),
                quantity: xss_array(mapToNumber(req.body.quantity, 0)),
                shipping_and_handling: xss_array(
                    toDollarAmount(req.body.shipping_and_handling, 0)
                ),
                tax: xss(toDollarAmount(req.body.tax, 0)),
                submitted_by: safeString(req.auth.info.email),
                draft: Boolean(safeString(req.body.draft)),
            });
            res.redirect("view/" + purchase.purchase_id);
        } catch (err) {
            console.error(err);
            res.render("pages/member/error", { statusCode: 500, error: err });
        }
    }
);

router.get(
    "/edit/:purchase_id",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        const purchase = await Purchase.findOne({
            purchase_id: req.params.purchase_id,
        });

        // if the purchase does not exist
        if (purchase == null)
            res.render("pages/member/error", {
                statusCode: 404,
                error: err ? err : "Purchase not found",
            });
        // if reason for purchase not given
        else if (req.params.reason_for_purchase === "")
            res.render("pages/member/error", {
                statusCode: 400,
                error: "Purchase reason missing",
            });
        // if the purchase is awaiting approval, admin rejected, or mentor rejected
        else if (
            purchase.submitted_by.toLowerCase() ===
                req.auth.info.email.toLowerCase() &&
            purchase.approval < 4
        )
            res.render("pages/member/purchase/edit", {
                purchase: purchase,
                creation: purchase._id.getTimestamp().toDateString(),
                total: purchase.totalCost(),
            });
        // otherwise, just view the purchase
        else res.render("pages/member/purchase/view", { purchase: purchase });
    }
);

router.post(
    "/edit/:purchase_id",
    auth.verifyRank(ranks.pr_whitelist),
    async (req, res) => {
        const purchase = await Purchase.findOne({
            purchase_id: req.params.purchase_id,
        });

        // only the creater of the PR can edit it
        if (
            purchase.submitted_by.toLowerCase() !==
            req.auth.info.email.toLowerCase()
        ) {
            res.render("pages/member/error", {
                statusCode: 403,
                error: "You are not authorized to edit this document",
            });
            return;
        }

        // cannot edit an already approved request
        if (purchase.approval >= 4) {
            res.render("pages/member/error", {
                statusCode: 409,
                error: "You cannot edit an already approved purchase request.",
            });
            return;
        }

        if (
            req.body.part_url === "" &&
            req.body.part_number === "" &&
            req.body.part_name === "" &&
            req.body.subsystem === "" &&
            req.body.part_url === "" &&
            !req.body.price_per_unit &&
            !req.body.quantity
        ) {
            req.body.part_url =
                req.body.part_number =
                req.body.part_name =
                req.body.subsystem =
                req.body.price_per_unit =
                req.body.quantity =
                    [];
        } else if (
            req.body.part_url[0] === "" &&
            req.body.part_number[0] === "" &&
            req.body.part_name[0] === "" &&
            req.body.subsystem[0] === "" &&
            req.body.part_url[0] === "" &&
            !req.body.price_per_unit[0] &&
            !req.body.quantity[0]
        ) {
            req.body.part_url.shift();
            req.body.part_number.shift();
            req.body.part_name.shift();
            req.body.subsystem.shift();
            req.body.price_per_unit.shift();
            req.body.quantity.shift();
        }

        try {
            const oldPurchase = await Purchase.findOne({
                purchase_id: req.params.purchase_id,
            });
            const oldApproval = oldPurchase.approval;
            const oldEdited = oldPurchase.edited_after_rejection;
            const purchase = await Purchase.findOneAndUpdate(
                { purchase_id: req.params.purchase_id },
                {
                    subteam: xss(safeString(req.body.subteam)),
                    vendor: xss(safeString(req.body.vendor)),
                    vendor_phone: xss(safeString(req.body.vendor_phone)),
                    vendor_email: xss(safeString(req.body.vendor_email)),
                    vendor_address: xss(safeString(req.body.vendor_address)),
                    reason_for_purchase: xss(
                        safeString(req.body.reason_for_purchase)
                    ),
                    part_url: xss_array(req.body.part_url),
                    part_number: xss_array(req.body.part_number),
                    part_name: xss_array(req.body.part_name),
                    subsystem: xss_array(req.body.subsystem),
                    price_per_unit: xss_array(
                        mapToDollarAmount(req.body.price_per_unit, 0)
                    ),
                    quantity: xss_array(mapToNumber(req.body.quantity, 0)),
                    shipping_and_handling: xss_array(
                        toDollarAmount(req.body.shipping_and_handling, 0)
                    ),
                    tax: xss(toDollarAmount(req.body.tax, 0)),
                    submitted_by: safeString(req.auth.info.email),
                    approval: 0,
                    draft: Boolean(safeString(req.body.draft)),
                    edited_after_rejection:
                        oldEdited || oldApproval === 1 || oldApproval === 3,
                }
            );
            res.redirect("../list");
        } catch (err) {
            console.error(err);
            res.render("pages/member/error", { statusCode: 500, error: err });
        }
    }
);

router.get("/total", auth.verifyRank(ranks.admin), (req, res) => {
    res.render("pages/member/purchase/total");
});

router.get("/total_plain", auth.verifyRank(ranks.admin), (req, res) => {
    const subteam = req.query.subteams
        ? req.query.subteams.map((num) => {
              if (num == null || num == "null") return null;
              return Number(num);
          })
        : null;
    const vendor = req.query.vendor
        ? req.query.vendor.split(",").map((str) => str.trim())
        : null;
    const submitted_by = req.query.submitted_by
        ? req.query.submitted_by.split(",").map((str) => str.trim())
        : null;

    const startDate = req.query.from
        ? moment(req.query.from, "YYYY-MM-DD").startOf("day")
        : null;
    const endDate = req.query.to
        ? moment(req.query.to, "YYYY-MM-DD").endOf("day")
        : null;

    const query = { approval: 4 };

    if (startDate || endDate) query.createdAt = {};
    if (startDate) query.createdAt["$gt"] = startDate;
    if (endDate) query.createdAt["$lt"] = endDate;
    if (subteam) query.subteam = { $in: subteam };
    if (vendor) query.vendor = { $in: vendor };
    if (submitted_by)
        query.submitted_by = new RegExp(submitted_by.join("|"), "i");

    Purchase.find(query)
        .then((purchases) => {
            let total = 0;
            for (const purchase of purchases) total += purchase.totalCost();
            res.send(total.toFixed(2));
        })
        .catch((err) => {
            console.error("[ERROR]", err);
            res.send("NaN");
        });
});

router.get("/search_by_keyword", async (req, res) => {
    try {
        let results = new Set();
        let fields = req.query.fields.split(",");
        let keyword = req.query.keyword
            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
            .toLowerCase();
        if (
            fields.length == 0 ||
            (fields.length == 1 && fields[0] == "") ||
            keyword == ""
        ) {
            res.send([]);
        } else {
            for (let i = 0; i < fields.length; i++) {
                if (!Object.keys(PURCHASE_FIELDS).includes(fields[i])) {
                    res.status(400).end(`Unknown field: ${fields[i]}`);
                    return;
                }
            }
            for (let i = 0; i < fields.length; i++) {
                let purchases = [];
                if (
                    [
                        "purchase_id",
                        "price_per_unit",
                        "quantity",
                        "shipping_and_handling",
                        "tax",
                    ].includes(fields[i])
                ) {
                    if (!isNaN(parseFloat(keyword))) {
                        purchases = await Purchase.find({
                            [fields[i]]: { $eq: keyword },
                        });
                    }
                } else {
                    purchases = await Purchase.find({
                        [fields[i]]: {
                            $regex: new RegExp(`.*${keyword}.*`, "i"),
                        },
                    });
                }
                for (let j = 0; j < purchases.length; j++) {
                    results.add(purchases[j].purchase_id);
                }
            }
            res.send([...results]);
        }
    } catch (err) {
        console.log(err);
        res.send([]);
    }
});

// must be an admin to see below pages
router.all("/*", function (req, res, next) {
    if (req.auth.level >= ranks.admin) {
        next();
    } else {
        res.render("pages/member/error", {
            statusCode: 401,
            error: "You must have higher authorization to reach this page.",
        });
    }
});

router.get("/admin", auth.verifyRank(ranks.admin), async (req, res) => {
    res.render("pages/member/purchase/list", {
        filter: "admin",
        fields: PURCHASE_FIELDS,
    });
});

router.post(
    "/admin/approve/:id",
    auth.verifyRank(ranks.admin),
    async (req, res) => {
        let mentorApproval = false;
        let query = {};
        // if mentor
        if (
            req.auth.level == ranks.mentor ||
            (req.auth.level >= ranks.superadmin && req.body.mentor === "true")
        ) {
            console.log(req.body.mentor);
            console.log("mentor");
            query.approval = 4;
            query.mentor_comments = safeString(req.body.comments);
            query.mentor_username = safeString(req.auth.info.email);
            query.mentor_date_approved = new Date();
            mentorApproval = true;
        }
        // if admin
        else {
            console.log("admin");
            query.approval = 2;
            query.admin_comments = safeString(req.body.comments);
            query.admin_username = safeString(req.auth.info.email);
            query.admin_date_approved = new Date();
        }
        try {
            const purchase = await Purchase.findOneAndUpdate(
                { purchase_id: req.params.id },
                query
            );
            if (purchase.draft) {
                res.status(400).send("The purchase request is a draft.");
            }
            if (req.body.updatedAt != purchase.updatedAt.getTime()) {
                res.status(409).send(
                    "The purchase request has been updated elsewhere, not approved."
                );
                return;
            }

            if (purchase == null) {
                res.status(404).send("Purchase not found");
                return;
            }
            let subject, to, text, html;
            if (mentorApproval) {
                subject = "Your purchase request has been approved.";
                to = purchase.submitted_by;
                text = `Your purchase has been approved! The purchase request can be found here: 
https://${config.server.domain}/member/purchase/view/${purchase.purchase_id}`;

                html = `Your purchase has been approved! The purchase request can be found here: 
<br/>
<a href="https://${config.server.domain}/member/purchase/view/${purchase.purchase_id}">
https://${config.server.domain}/member/purchase/view/${purchase.purchase_id}
</a>`;
            } else {
                subject = "A purchase request is awaiting your approval.";
                to = MENTOR_EMAIL;
                text = `A purchase request is awaiting your approval! The purchase request can be found here: 
https://${config.server.domain}/member/purchase/view/${purchase.purchase_id}

You can see all pending requests here:
http://${config.server.domain}/member/purchase/mentor`;

                html = `A purchase request is awaiting your approval! The purchase request can be found here: 
<br/>
<a href="https://${config.server.domain}/member/purchase/view/${purchase.purchase_id}">
https://${config.server.domain}/member/purchase/view/${purchase.purchase_id}
</a><br/><br/>
You can see all pending requests here:<br/>
<a href="http://${config.server.domain}/member/purchase/mentor">
http://${config.server.domain}/member/purchase/mentor
</a>`;
            }

            // only doesn't send an email when the single mentor mail setting is activated and the email is to a mentor
            if (!(config.automail.singleMentorMail && !mentorApproval)) {
                email.sendMail(
                    config.automail.auth.email,
                    to,
                    subject,
                    text,
                    html
                );
            }

            res.status(200).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: "false",
                error: { message: err.toString() },
            });
        }
    }
);

router.post(
    "/admin/reject/:id",
    auth.verifyRank(ranks.admin),
    function (req, res) {
        let query = {};
        // if mentor
        if (
            req.auth.level == ranks.mentor ||
            (req.auth.level >= ranks.superadmin && req.body.mentor === "true")
        ) {
            query.approval = 3;
            query.mentor_comments = safeString(req.body.comments);
            query.mentor_username = safeString(req.auth.info.email);
            query.mentor_date_approved = new Date();
            query.edited_after_rejection = false;
        }
        // if admin
        else {
            query.approval = 1;
            query.admin_comments = safeString(req.body.comments);
            query.admin_username = safeString(req.auth.info.email);
            query.admin_date_approved = new Date();
            query.edited_after_rejection = false;
        }
        Purchase.findOneAndUpdate(
            { purchase_id: req.params.id },
            query,
            function (err, purchase) {
                if (err) {
                    res.status(500).json({
                        success: "false",
                        error: { message: err },
                    });
                    return;
                }
                if (purchase == null) {
                    res.status(404).json({
                        success: "false",
                        error: { message: "Purchase not found" },
                    });
                    return;
                }
                res.status(200).send();
            }
        );
    }
);

/*router.get('/photos', function (req, res) {
  res.render('pages/member/photos')
  })*/

// must be an mentor to see below pages
router.all("/*", function (req, res, next) {
    if (req.auth.level >= ranks.mentor) {
        next();
    } else {
        res.render("pages/member/error", {
            statusCode: 401,
            error: "You must have higher authorization to reach this page.",
        });
    }
});

router.get("/mentor", function (req, res) {
    res.render("pages/member/purchase/list", {
        filter: "mentor",
        fields: PURCHASE_FIELDS,
    });
});

module.exports = router;
