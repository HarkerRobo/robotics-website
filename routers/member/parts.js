"use strict";

const express = require("express"),
    router = express.Router(),
    Part = require("../../models/part"),
    ranks = require("../../helpers/ranks.json"),
    auth = require("../../helpers/auth"),
    Xray = require("x-ray"),
    { promisify } = require("util"),
    x = Xray();

const verifyPartID = (partID) => {
    return new Promise((resolve, reject) => {
        const partIDRegex = /^(\d+)_(\d)(\d{2})$/g;
        const result = partIDRegex.exec(partID);

        if (result === null) reject("Part ID is not valid");
        else
            resolve([
                parseInt(result[1], 10),
                parseInt(result[2], 10),
                parseInt(result[3], 10),
            ]);
    });
};

router.get("/create", auth.verifyRank(ranks.harker_student), (req, res) => {
    res.render("pages/member/parts/create");
});

router.get("/search", auth.verifyRank(ranks.harker_student), (req, res) => {
    res.render("pages/member/parts/search");
});

// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-an-array-remove-duplicates
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

async function getPossibleFolders(query, sel) {
    let select = { _id: 0 };
    select[sel] = 1;
    let sort = {};
    sort[sel] = 1;
    const parts_obj = await Part.find(query).select(select).sort(sort).lean();
    let parts_arr = [];
    for (const part of parts_obj) parts_arr.push(part[sel]);
    return parts_arr.filter(onlyUnique);
}

router.get("/spec", auth.verifyRank(ranks.harker_student), async (req, res) => {
    res.json(await getPossibleFolders({}, "year"));
});

router.get(
    "/spec/:year",
    auth.verifyRank(ranks.harker_student),
    async (req, res) => {
        res.json(
            await getPossibleFolders({ year: req.params.year }, "robot_type")
        );
    }
);

router.get(
    "/spec/:year/:robot_type",
    auth.verifyRank(ranks.harker_student),
    async (req, res) => {
        res.json(await getPossibleFolders(req.params, "subassembly"));
    }
);

router.get(
    "/spec/:year/:robot_type/:subassembly",
    auth.verifyRank(ranks.harker_student),
    async (req, res) => {
        res.json(await getPossibleFolders(req.params, "metal_type"));
    }
);

router.get(
    "/spec/:year/:robot_type/:subassembly/:metal_type",
    auth.verifyRank(ranks.harker_student),
    async (req, res) => {
        res.json(await getPossibleFolders(req.params, "specific_id"));
    }
);

router.get(
    "/spec/:year/:robot_type/:subassembly/:metal_type/:specific_id",
    auth.verifyRank(ranks.harker_student),
    async (req, res) => {
        const part = await Part.findOne(req.params).lean();
        part.isAuthor = part.author === req.auth.info.email;
        if (!part) res.status(404).json({});
        else res.json(part);
    }
);

router.get(
    "/folders",
    auth.verifyRank(ranks.harker_student),
    async (req, res) => {
        res.render("pages/member/parts/folders");
    }
);

router.get("/id/:partid", auth.verifyRank(ranks.harker_student), (req, res) => {
    verifyPartID(req.params.partid)
        .then((partid) => {
            var query = {
                subassembly: partid[0],
                metal_type: partid[1],
                specific_id: partid[2],
            };

            console.log(req.query);

            var year = parseInt(req.query.year, 10);
            if (!isNaN(year)) query.year = year;

            var robot_type = parseInt(req.query.robot_type, 10);
            if (!isNaN(robot_type)) query.robot_type = robot_type;

            Part.findOne(query)
                .lean()
                .then((part) => {
                    if (part === null)
                        res.status(404).json({
                            success: false,
                            error: { message: "Part not found" },
                        });
                    else {
                        part.isAuthor = part.author === req.auth.info.email;
                        res.json(part);
                    }
                })
                .catch((err) => {
                    res.status(500).json({
                        success: false,
                        error: { message: err },
                    });
                });
        })
        .catch(() => {
            res.status(400).json({
                success: false,
                error: { message: "PartID does not match specified pattern" },
            });
        });
});

// TODO: make this a scraper, this method is not always accurate
// maybe use xray?
function parseImgur(link) {
    const regex = /^(http(s)?:)?\/\/imgur\.com\/(a\/)?([^\/\.]+)$/;
    if (regex.test(link)) {
        console.log("hmm");
        console.log(link);
        return new Promise((resolve, reject) => {
            x(
                link,
                ".post-images .post-image-container@id"
            )(function (err, res) {
                if (err || !res) resolve(link);
                else resolve("https://imgur.com/" + res + ".jpeg");
            });
        });
    } else return Promise.resolve(link);
}

async function createPart(req, partid, robot_type) {
    const testpart = await Part.find({
        year: req.body.year,
        robot_type: robot_type,
        subassembly: partid[0],
        metal_type: partid[1],
        specific_id: partid[2],
    });

    if (testpart.length > 0)
        return await Promise.reject({
            status: 409,
            msg: "Part with the same specifications already exists.",
        });

    return await Part.create({
        year: req.body.year,
        robot_type: robot_type,
        subassembly: partid[0],
        metal_type: partid[1],
        specific_id: partid[2],
        part_status: req.body.part_status,
        description: req.body.description,
        quantity: req.body.quantity,
        image: await parseImgur(req.body.image),
        cadlink: req.body.cadlink,
        competition: req.body.competition,
        author: req.auth.info.email,
    });
}

router.post(
    "/id/:partid",
    auth.verifyRank(ranks.parts_whitelist),
    (req, res) => {
        verifyPartID(req.params.partid)
            .then((partid) => {
                let promises = [];
                let robot_types;

                try {
                    robot_types = JSON.parse(req.body.robot_type);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        robot_types = [req.body.robot_type];
                    } else {
                        res.status(500).json({
                            success: false,
                            error: { message: e },
                        });
                        return;
                    }
                }

                try {
                    if (Array.isArray(robot_types)) {
                        for (const robot_type of robot_types)
                            promises.push(createPart(req, partid, robot_type));
                    } else
                        promises.push(
                            createPart(req, partid, req.body.robot_type)
                        );
                } catch (e) {
                    console.error(e);
                }

                Promise.all(promises)
                    .then((list) => {
                        res.send(list);
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(err && err.status ? err.status : 500).json({
                            success: false,
                            error: { message: err.msg || err },
                        });
                    });
            })
            .catch((err) => {
                res.status(500).json({
                    success: false,
                    error: { message: err },
                });
            });
    }
);

router.get(
    "/edit/:year/:robot_type/:partid",
    auth.verifyRank(ranks.parts_whitelist),
    (req, res) => {
        verifyPartID(req.params.partid)
            .then((partid) => {
                Part.findOne({
                    year: req.params.year,
                    robot_type: req.params.robot_type,
                    subassembly: partid[0],
                    metal_type: partid[1],
                    specific_id: partid[2],
                })
                    .lean()
                    .then((part) => {
                        if (part.author !== req.auth.info.email)
                            res.render("pages/member/error", {
                                statusCode: 401,
                                error: "Email does not match that of author.",
                            });
                        else if (part === null)
                            res.render("pages/member/error", {
                                statusCode: 500,
                                error: "Part not found",
                            });
                        else
                            res.render("pages/member/parts/edit", {
                                part: part,
                                partid: req.params.partid,
                            });
                    })
                    .catch((err) => {
                        res.render("pages/member/error", {
                            statusCode: 500,
                            error: err,
                        });
                    });
            })
            .catch((err) => {
                res.render("pages/member/error", {
                    statusCode: 500,
                    error: err,
                });
            });
    }
);

router.post(
    "/edit_status/:year/:robot_type/:partid",
    auth.verifyRank(ranks.parts_whitelist),
    async (req, res) => {
        try {
            const partid = await verifyPartID(req.params.partid);
            let part = await Part.findOne({
                year: req.params.year,
                robot_type: req.params.robot_type,
                subassembly: partid[0],
                metal_type: partid[1],
                specific_id: partid[2],
            });
            if (part.author !== req.auth.info.email)
                throw new Error("Email does not match that of author.");
            part.part_status = req.body.part_status;
            res.json(await part.save());
        } catch (err) {
            if (!err) err = "";
            res.status(err.status || 500).json({
                success: false,
                error: { message: err.message || err },
            });
            console.error(`[REQ: ${req.request_id}] [ERROR] ${err}`);
        }
    }
);

router.post(
    "/edit/:year/:robot_type/:partid",
    auth.verifyRank(ranks.parts_whitelist),
    async (req, res) => {
        try {
            const partid = await verifyPartID(req.params.partid);
            let part = await Part.findOne({
                year: req.params.year,
                robot_type: req.params.robot_type,
                subassembly: partid[0],
                metal_type: partid[1],
                specific_id: partid[2],
            });
            if (part.author !== req.auth.info.email)
                throw new Error("Email does not match that of author.");
            const newpartid = await verifyPartID(req.body.partid);

            part.year = req.body.year;
            part.subassembly = newpartid[0];
            part.metal_type = newpartid[1];
            part.specific_id = newpartid[2];
            part.description = req.body.description;
            part.image = await parseImgur(req.body.image);
            part.cadlink = req.body.cadlink;
            part.quantity = req.body.quantity;
            part.part_status = req.body.part_status;

            res.json(await part.save());
        } catch (err) {
            if (!err) err = "";
            res.status(err.status || 500).json({
                success: false,
                error: { message: err.message || err },
            });
            console.error(`[REQ: ${req.request_id}] [ERROR] ${err}`);
        }
    }
);

module.exports = router;
