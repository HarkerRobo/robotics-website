const sessionAuth = (req, res, next) => {
    req.auth = req.session.auth;
    if (!req.auth) req.auth = { loggedin: false };
    res.locals.auth = req.auth;
    next();
};

const verifyLogin = (req, res, next) => {
    sessionAuth(req, res, () => {
        if (req.auth.loggedin) {
            console.log(
                `[REQ: ${req.request_id}] Authed as: ${req.auth.info.name} (${req.auth.info.email})`
            );
            console.log(
                `[REQ: ${req.request_id}] Auth level: ${req.auth.level}`
            );
            next();
        } else {
            res.render("pages/member/login");
        }
    });
};

const verifyRank = (rank) => {
    return (req, res, next) => {
        verifyLogin(req, res, () => {
            if (req.auth.level >= rank) next();
            else
                res.render("pages/member/error", {
                    statusCode: 401,
                    error: "You must have higher authorization to reach this page.",
                });
        });
    };
};

module.exports = {
    sessionAuth,
    verifyLogin,
    verifyRank,
};
