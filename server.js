const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
const fs = require("fs");

// JSON dosyasına veri ekleyen yardımcı fonksiyon
function appendToJSONFile(filename, newItem) {
  const filePath = path.join(__dirname, filename);
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : [];
  newItem.id = Date.now();
  data.push(newItem);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Yorum ekle
app.post("/add-comment", (req, res) => {
  const { ad, mesaj } = req.body;
  if (!ad || !mesaj) return res.status(400).send("Eksik veri.");
  appendToJSONFile("yorumlar.json", { ad, mesaj });
  res.status(200).send("Yorum kaydedildi.");
});

// Öneri ekle
app.post("/add-suggestion", (req, res) => {
  const { ad, mesaj } = req.body;
  if (!ad || !mesaj) return res.status(400).send("Eksik veri.");
  appendToJSONFile("oneriler.json", { ad, mesaj });
  res.status(200).send("Öneri kaydedildi.");
});

const PORT = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "brdevelopment2@gmail.com",
    pass: process.env.GMAIL_APP_PASS || "otovdndfuteleftf",
  },
});

const verificationCache = new Map();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: "Çok fazla istek yaptınız. Lütfen 1 dakika sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/send-code", limiter, (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("E-posta adresi gerekli.");

    const ip = req.ip;

    if (email.toLowerCase() !== "brdevelopment2@gmail.com") {
      return res.status(403).send("Yetkisiz e-posta adresi.");
    }

    const cached = verificationCache.get(email);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return res.status(429).send("Zaten gönderilmiş kodunuz mevcut, lütfen bekleyin.");
    }

    const code = generateCode();

    const mailOptions = {
      from: `"Pixel Clash Admin" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Pixel Clash Admin Giriş Kodu",
      text: `Merhaba,\n\nPixel Clash Admin giriş kodunuz: ${code}\n\nEğer bu isteği siz yapmadıysanız lütfen dikkate almayın.\n\nİp adresi: ${ip}\n\nTeşekkürler,\nPixel Clash Ekibi`,
      html: `<h2>Pixel Clash Admin Giriş Kodu</h2>
             <p>Merhaba,</p>
             <p><strong>Giriş kodunuz:</strong> <span style="font-size: 24px; color: #3498db;">${code}</span></p>
             <p>Eğer bu isteği siz yapmadıysanız lütfen dikkate almayın.</p>
             <p><i>İp adresi: ${ip}</i></p>
             <hr/>
             <small>Pixel Clash Ekibi</small>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Mail gönderme hatası:", error);
        return res.status(500).send("Kod gönderilemedi, tekrar deneyin.");
      }

      verificationCache.set(email, {
        code,
        ip,
        expiresAt: now + 5 * 60 * 1000,
      });

      console.log(`Kod gönderildi: ${email} - Kod: ${code} - IP: ${ip}`);
      return res.status(200).send("Kod başarıyla gönderildi.");
    });
  } catch (e) {
    console.error("send-code hata:", e);
    res.status(500).send("Sunucu hatası.");
  }
});

app.post("/verify-code", (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).send("E-posta ve kod gerekli.");

    const ip = req.ip;

    const cached = verificationCache.get(email);
    const now = Date.now();

    if (!cached || cached.expiresAt < now || cached.code !== code || cached.ip !== ip) {
      return res.status(403).send("Kod veya IP doğrulanamadı.");
    }

    verificationCache.delete(email);

    console.log(`Başarılı giriş: ${email} - IP: ${ip}`);
    res.status(200).send("Doğrulama başarılı, giriş yapıldı.");
  } catch (e) {
    console.error("verify-code hata:", e);
    res.status(500).send("Sunucu hatası.");
  }
});

app.get("/logout", (req, res) => {
  res.status(200).send("Çıkış yapıldı.");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Pixel Clash API sunucusu çalışıyor: http://localhost:${PORT}`);
});
