//node emailService.js

const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors"); // Új sor: CORS middleware importálása
const axios = require("axios"); // Axios a reCAPTCHA ellenőrzéshez

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173', // A Vue.js frontend pontos URL-je
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Ideiglenes tároló a verifikációs kódokhoz
const verificationCodes = {};

// Nodemailer konfiguráció
const transporter = nodemailer.createTransport({
  service: "gmail", // Használj megfelelő email szolgáltatót
  auth: {
    user: "souris20013@gmail.com", // Saját email címed
    pass: "upkh wsof azoo xqmx", // Saját email jelszavad vagy app password
  },
});

// Verifikációs kód küldése
app.post('/send-verification-code', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail cím szükséges.' });
  }

  // Generálj egy 6 számjegyű kódot
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = verificationCode;

  console.log(`Verifikációs kód (${verificationCode}) elküldve az e-mail címre: ${email}`);

  const mailOptions = {
    from: "souris20013@gmail.com",
    to: email,
    subject: "Széchenyi Egyetem - Email Verifikáció",
    html: `
      <div style="font-family: 'Montserrat', sans-serif; font-weight: 300; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <header style="text-align: center; padding: 20px 0; background-color: #1c2442; color: #fff; border-radius: 8px 8px 0 0;">
          <img src="cid:logo" alt="Széchenyi Egyetem" style="max-width: 250px; margin-bottom: 10px;">
        </header>
        <main style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">Kedves Felhasználó!</p>
          <p style="font-size: 16px; color: #333;">Köszönjük, hogy regisztráltál a Széchenyi István Egyetem rendszerébe. Az email címed hitelesítéséhez kérjük, használd az alábbi verifikációs kódot:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #1c2442;">${verificationCode}</span>
          </div>
          <p style="font-size: 16px; color: #333;">Ha nem te kezdeményezted ezt a műveletet, kérjük, hagyd figyelmen kívül ezt az emailt.</p>
          <p style="font-size: 16px; color: #333;">Üdvözlettel,</p>
          <p style="font-size: 16px; color: #333; font-weight: bold;">Széchenyi István Egyetem Csapata</p>
        </main>
        <footer style="text-align: center; padding: 10px 0; background-color: #f4f4f4; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">Széchenyi István Egyetem</p>
          <p style="margin: 0;">9026 Győr, Egyetem tér 1.</p>
          <p style="margin: 0;">Telefon: +36 96 503 400</p>
          <p style="margin: 0;">Email: info@sze.hu</p>
        </footer>
      </div>
    `,
    attachments: [
      {
        filename: "logo.png",
        path: __dirname + "/assets/logo.png", // Helyi fájl elérési útvonala
        cid: "logo", // Content-ID azonosító
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email küldési hiba:", error);
      return res.status(500).send("Hiba történt az email küldése során.");
    }
    console.log("Email sikeresen elküldve:", info.response);
    res.status(200).send("Email sikeresen elküldve!");
  });
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Verifikációs kód ellenőrzése
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'E-mail és kód szükséges.' });
  }

  // Ellenőrizd, hogy a kód helyes-e
  if (verificationCodes[email] === code) {
    delete verificationCodes[email]; // Töröld a kódot, miután ellenőrizted
    return res.status(200).json({ success: true, message: 'A kód helyes.' });
  }

  return res.status(400).json({ success: false, message: 'A kód helytelen.' });
});

// reCAPTCHA ellenőrzés
app.post('/verify-captcha', async (req, res) => {
  const { token } = req.body; // A frontend által küldött reCAPTCHA token

  if (!token) {
    return res.status(400).json({ success: false, message: 'CAPTCHA token szükséges.' });
  }

  try {
    // Küldd el a reCAPTCHA token-t a Google szerverének ellenőrzésre
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: "6LcOygYrAAAAALuDfA3ui1R_11i0Oeo8e1MMFnQi",
          response: token,
        },
      }
    );

    if (response.data.success) {
      return res.status(200).json({ success: true, message: 'CAPTCHA sikeresen ellenőrizve.' });
    } else {
      return res.status(400).json({ success: false, message: 'CAPTCHA ellenőrzés sikertelen.', errors: response.data['error-codes'] });
    }
  } catch (error) {
    console.error("Hiba történt a CAPTCHA ellenőrzése során:", error);
    return res.status(500).json({ success: false, message: 'Szerverhiba történt a CAPTCHA ellenőrzése során.' });
  }
});

// Backend indítása
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});