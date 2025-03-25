const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors"); // Új sor: CORS middleware importálása

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:5173', // A Vue.js frontend pontos URL-je
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Nodemailer konfiguráció
const transporter = nodemailer.createTransport({
  service: "gmail", // Használj megfelelő email szolgáltatót
  auth: {
    user: "souris20013@gmail.com", // Saját email címed
    pass: "upkh wsof azoo xqmx", // Saját email jelszavad vagy app password
  },
});

// Email küldés API
app.post("/send-verification-code", (req, res) => {
  const { email, verificationCode } = req.body;

  const mailOptions = {
    from: "souris20013@gmail.com",
    to: email,
    subject: "Email Verification Code",
    text: `Your verification code is: ${verificationCode}`,
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

// Backend indítása
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});