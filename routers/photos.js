"use strict";

const express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    moment = require("moment"),
    multiparty = require("multiparty"),
    format = require("util").format,
    compression = require("compression"),
    mongoose = require("../db.js"),
    path = require("path"),
    fs = require("fs"),
    util = require("util");

/*router.get('/', function(req, res) {
  res.render('pages/photos')
})

router.post('/test', function(req, res) {
  console.log("LOCALS:", req.app.locals)
  res.send("OK");
})*/

//router.use(bodyParser({uploadDir:__dirname+'/static/uploads/'}));

router.get("/", function (req, res) {
    res.send(
        '<form method="post" enctype="multipart/form-data">' +
            '<p>Title: <input type="text" name="title" /></p>' +
            '<p>Image: <input type="file" name="image" /></p>' +
            '<p><input type="submit" value="Upload" /></p>' +
            "</form>"
    );
});

router.post("/", function (req, res) {
    var form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.statusCode(400).end("invalid request: " + err.message);
            return;
        }
        //res.writeHead(200, {'content-type': 'text/plain'});
        let img = files.image[0],
            tempPath = img.path,
            targetPath =
                path.resolve(__dirname, "../static/uploads/") +
                "/" +
                encodeURIComponent(fields.title[0]);
        fs.rename(tempPath, targetPath, function (err) {
            if (err) throw err;
            console.log("Upload completed!");
        });
        res.send(
            "received fields:\n\n " +
                util.inspect(fields) +
                "<br/><br/>" +
                "received files:\n\n " +
                util.inspect(files)
        );
        console.log(util.inspect(files));
    });
    /*var tempPath = req.files.displayImage.path,
        targetPath = path.resolve(__dirname+'static/uploads/image.png');
    if (true) { // if there is nothing wrong with the file

    } else {
        fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .png files are allowed!");
        });
    }
    // ...*/
});

router.get("/:imgid", function (req, res) {
    res.sendFile(path.resolve("./static/uploads/", req.params.imgid));
});

module.exports = router;
