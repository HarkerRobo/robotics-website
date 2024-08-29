let nodemailer = require("nodemailer"),
    config = require(__base + "config.json");

var transporter = nodemailer.createTransport({
    host: config.automail.auth.host,
    port: config.automail.auth.port,
    secure: config.automail.auth.secure,
    auth: {
      user: config.automail.auth.username,
      pass: config.automail.auth.password
    },
    tls: { rejectUnauthorized: false }
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
