let sgMail = require("@sendgrid/mail"),
    config = require(__base + "config.json");

sgMail.setApiKey(config.automail.apiKey);

const sendMail = (from, to, subject, text, html) => {
    let payload = {
        from: from,
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        html: html,
    };

    sgMail
        .send(payload)
        .then(() => {
            console.log("Email sent to " + to + " from " + from);
        })
        .catch((error) => {
            console.error(error);
            if (error.response) {
                const { message, code, response } = error;

                const { headers, body } = response;

                console.error(body);
            }
        });
};

exports.sendMail = sendMail;
