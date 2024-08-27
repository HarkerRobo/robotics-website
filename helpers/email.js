let nodemailer = require("nodemailer"),
    config = require(__base + "config.json");

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.automail.auth.user,
        pass: config.automail.auth.pass,
    },
});

const sendMail = (from, to, subject, text, html) => {
    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}

exports.sendMail = sendMail;
