require('dotenv').config()

const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const accountSid = "ACc992028f2ca9d6103c5cb63de4fd84c5"; 
const authToken = "cb37c5d4a40d2a13a1964834e160a4d5"; 
const client = require('twilio')(accountSid, authToken);
const schedule = require("node-schedule");


// ------------ Every 20minutes
schedule.scheduleJob("*/5 * * * *", () => {
  (async () => {
    const browser = await puppeteer.launch({ headless: true, args : ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto('https://admissions.42.fr/users/sign_in');
  
  
    //LOGIN
    await page.type('#user_email', "roland.vrignon@gmail.com");
    await page.type('#user_password', "SqH$aNa$36crJnDS");
    await page.keyboard.down('Tab')
    await page.keyboard.press('Enter');
    await page.waitForNavigation()
  
    //Check IF CHECKIN AVAILABLE
  
    const stringIsIncluded = await page.evaluate(() => {
      const string = "Il n'y a pas de check-in disponible pour le moment, nous t'informerons dès qu'il y en aura un de disponible.";
      const selector = 'h5';
      return document.querySelector(selector).innerText.includes(string);
    });
  
    if (stringIsIncluded) {
      console.log("pas de dispos");
      browser.close();
    } else {
      console.log("dispooooo");
  
      //Send me an email
  
      const transporter = nodemailer.createTransport({
        host: "pro2.mail.ovh.net",
        port: "587",
        auth: {
          user: "roland@blindating.io",
          pass: "nCtYG?$e@35X6dBt",
        },
      });
  
      const options = {
        from: "roland@blindating.io",
        to: "roland.vrignon@gmail.com",
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
          body: 'Check-in disponible sur le portail 42 !',
          messagingServiceSid: "MG8e8dec5740ceabef7428014e08fc3548",
          to: "+33769701268"
        })
        .then(message => console.log(message.sid))
        .done();
  
      //Close browser
      browser.close()
    }
  })();
});


