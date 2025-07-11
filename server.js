const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Güvenli Gmail transporter - .env dosyasından almanızı öneririm
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "brdevelopment2@gmail.com",
    pass: process.env.GMAIL_APP_PASS || "otovdndfuteleftf", // kesinlikle .env kullanın
  },
});

// Kodları ve IP'leri tutmak için cache (basit memory storage)
const verificationCache = new Map(); // key: email, value: {code, expiresAt, ip}

// IP bazlı rate limit middleware (1 dk içinde 3 istekle sınırla)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 3,
  message: "Çok fazla istek yaptınız. Lütfen 1 dakika sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

function generateCode() {
  // 6 haneli sayı kodu (ör: 123456)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/send-code", limiter, (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("E-posta adresi gerekli.");

    const ip = req.ip;

    // Sadece admin e-posta izni (örnek)
    if (email.toLowerCase() !== "brdevelopment2@gmail.com") {
      return res.status(403).send("Yetkisiz e-posta adresi.");
    }

    // Önceki kod varsa süresine bak
    const cached = verificationCache.get(email);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return res.status(429).send("Zaten gönderilmiş kodunuz mevcut, lütfen bekleyin.");
    }

    // Yeni kod üret
    const code = generateCode();

    // Mail içeriği - HTML ve text
    const mailOptions = {
      from: `"Pixel Clash Admin" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Pixel Clash Admin Giriş Kodu",
      text: `Merhaba,

Pixel Clash Admin giriş kodunuz: ${code}

Eğer bu isteği siz yapmadıysanız lütfen dikkate almayın.

İp adresi: ${ip}

Teşekkürler,
Pixel Clash Ekibi`,
      html: `<h2>Pixel Clash Admin Giriş Kodu</h2>
             <p>Merhaba,</p>
             <p><strong>Giriş kodunuz:</strong> <span style="font-size: 24px; color: #3498db;">${code}</span></p>
             <p>Eğer bu isteği siz yapmadıysanız lütfen dikkate almayın.</p>
             <p><i>İp adresi: ${ip}</i></p>
             <hr/>
             <small>Pixel Clash Ekibi</small>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Mail gönderme hatası:", error);
        return res.status(500).send("Kod gönderilemedi, tekrar deneyin.");
      }

      // Kod ve ip cache’e kaydet (geçerlilik 5 dk)
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

// Kod doğrulama
app.post("/verify-code", (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).send("E-posta ve kod gerekli.");

    const ip = req.ip;

    const cached = verificationCache.get(email);
    const now = Date.now();

    if (
      !cached ||
      cached.expiresAt < now ||
      cached.code !== code ||
      cached.ip !== ip
    ) {
      return res.status(403).send("Kod veya IP doğrulanamadı.");
    }

    // Başarılı doğrulama, cache’den sil
    verificationCache.delete(email);

    console.log(`Başarılı giriş: ${email} - IP: ${ip}`);

    // Burada kullanıcı session/token sistemi eklenebilir, şimdilik ok gönderiyoruz
    res.status(200).send("Doğrulama başarılı, giriş yapıldı.");
  } catch (e) {
    console.error("verify-code hata:", e);
    res.status(500).send("Sunucu hatası.");
  }
});

app.get("/logout", (req, res) => {
  // Basit logout işlemi, gerçek session yönetimi eklenmeli
  res.status(200).send("Çıkış yapıldı.");
});

app.listen(PORT, () => {
  console.log(`✅ Pixel Clash API sunucusu çalışıyor: http://localhost:${PORT}`);
});
