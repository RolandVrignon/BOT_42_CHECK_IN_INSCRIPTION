require("dotenv").config();

const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = require("twilio")(accountSid, authToken);
const schedule = require("node-schedule");

// ------------ Every 20minutes
schedule.scheduleJob("*/5 * * * *", () => {
  (async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto("https://admissions.42.fr/users/sign_in");

    //LOGIN
    await page.type("#user_email", process.env.USER_MAIL);
    await page.type("#user_password", process.env.USER_PASSWORD);
    await page.keyboard.down("Tab");
    await page.keyboard.press("Enter");
    await page.waitForNavigation();

    //Check IF CHECKIN AVAILABLE

    const stringIsIncluded = await page.evaluate(() => {
      const string =
        "Il n'y a pas de check-in disponible pour le moment, nous t'informerons dès qu'il y en aura un de disponible.";
      const selector = "h5";
      return document.querySelector(selector).innerText.includes(string);
    });

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    if (stringIsIncluded) {
      console.log(today.toUTCString(), " : pas de dispos");
      browser.close();
    } else {
      console.log(today.toUTCString(), " : dispooooo");

      //Send me an email

      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL,
          pass: process.env.MAIL_PASS,
        },
      });

      const options = {
        from: process.env.MAIL,
        to: process.env.USER_MAIL,
        subject: "Inscription à 42 disponible morray 🤟⚡️",
        text: "Inscripts toi dès maintenant",
      };

      transporter.sendMail(options, (err, info) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Email sent !!");
      });

      //Send me an SMS

      client.messages
        .create({
          body: "Check-in disponible sur le portail 42 !",
          messagingServiceSid: process.env.MESSAGINGSID,
          to: process.env.PHONENUMBER,
        })
        .then((message) => console.log(message.sid))
        .done();

      //Close browser
      browser.close();
    }
  })();
});
