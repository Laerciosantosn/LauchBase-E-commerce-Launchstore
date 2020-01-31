const nodemailer = require("nodemailer")

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0aa3765e07da07",
      pass: "2160e56b2b86f3"
    }
  });
