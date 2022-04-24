const ranks = require("./ranks.json");

let currentSergeant = null;
let io = null;

// TODO: make these functions
let newSergeantConnection = (message) => {};
let messageFromSergeant = (message) => {};
let sendCurrentSergeant = (message) => {};

exports.init = (server) => {
    io = require("socket.io").listen(server);
    io.use((socket, next) => {
        require("./session")(socket.request, socket.request.res, next);
    });
    io.use((socket, next) => {
        require("./auth").sessionAuth(socket.request, socket.request.res, next);
    });

    io.sockets.on("connection", (socket) => {
        // if sergeant already exists, close the socket
        if (currentSergeant !== null) {
            socket.destroy();
            return;
        }

        // if the user cannot be a sergeant, close the socket
        if (req.auth.level < ranks.scouting_sergeants) {
            socket.destroy();
            return;
        }

        // TODO: make this the session id
        currentSergeant = socket.id;

        socket.on("disconnect", () => {
            currentSergeant = null;
        });
    });
};

exports.getCurrentSergeant = () => currentSergeant;
exports.onConnection = (func) => {
    newSergeantConnection = func;
};

exports.onMessage = (func) => {
    messageFromSergeant = func;
};

exports.emitSergeant = (type, message) => {
    if (io == null) throw new Error("socket.io has not been initialized");
    if (currentSergeant == null) throw new Error("Sergeant is not connected");

    io.sockets.connected[currentSergeant].emit(type, message);
};
