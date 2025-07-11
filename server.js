// ✅ server.js - Gmail doğrulamalı giriş sistemi + yorum sistemi
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const ADMIN_EMAIL = "brdevelopment2@gmail.com";
let verificationCodes = {}; // Gmail -> code

// ✅ Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "brdevelopment2@gmail.com",
    pass: "otovdndfuteleftf", // uygulama şifresi
  },
});

// ✅ Kod gönderme endpoint
app.post("/send-code", (req, res) => {
  const { email } = req.body;
  if (email !== ADMIN_EMAIL) return res.status(403).send("Yetkisiz Gmail");
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  transporter.sendMail({
    from: ADMIN_EMAIL,
    to: email,
    subject: "Giriş Doğrulama Kodu",
    text: `Giriş yapmak için doğrulama kodunuz: ${code}`,
  });

  res.send("Kod gönderildi");
});

// ✅ Kod doğrulama endpoint
app.post("/verify-code", (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] === code) {
    req.session.loggedIn = true;
    res.send("Giriş başarılı");
  } else {
    res.status(401).send("Kod yanlış");
  }
});

// ✅ Giriş kontrol endpoint
app.get("/check-auth", (req, res) => {
  res.json({ loggedIn: req.session.loggedIn });
});

// ✅ Çıkış
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Çıkış yapıldı");
  });
});

// ✅ Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
