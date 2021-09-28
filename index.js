require('dotenv').config()

const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://admissions.42.fr/users/sign_in');


  //LOGIN
  await page.type('#user_email', process.env.USER_MAIL);
  await page.type('#user_password', process.env.USER_PASSWORD);
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


  }

  setTimeout(function () {
    browser.close();
  }, 4000)



})();