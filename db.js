const mongoose = require("mongoose");
const config = require("./config.json");

mongoose.Promise = global.Promise;

mongoose.connect(
    `mongodb://${
        config.database.auth
            ? config.database.auth.username +
              ":" +
              config.database.auth.password +
              "@"
            : ""
    }localhost:${config.database.port}/${config.database.databaseName}`,
    {
        config: {
            autoIndex: false,
        },
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const db = mongoose.connection;

db.on("error", () => {
    console.error("MongoDB connection error");
    process.exit(1);
});

db.once("open", () => {
    console.log("Successfully connected to MongoDB");
});

module.exports = mongoose;
