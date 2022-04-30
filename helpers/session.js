const config = require("../config.json");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

// initializes the session
// DO NOT USE WITHOUT STORE: CAUSES MEMORY LEAKS
// For more information, go to https://github.com/expressjs/session#compatible-session-stores

module.exports = session({
    store: new MongoStore({
        url: `mongodb://localhost/robotics-website`,
    }),
    secure: config.server.production,
    secret: config.cookie.secret,
    name: config.cookie.name,
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
});
