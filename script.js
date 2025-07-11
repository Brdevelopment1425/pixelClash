// Yüklenme ekranını gizleme fonksiyonu
function hideLoadingScreen() {
  const loader = document.getElementById('loader');
  if (!loadingScreen) return;

  loader.style.transition = 'opacity 0.5s ease';
  loader.style.opacity = '0';

  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

// Sayfa tamamen yüklendiğinde yüklenme ekranını gizle
window.addEventListener('load', () => {
  hideLoadingScreen();
});

// Gelişmiş kötü kelime filtresi (Türkçe + İngilizce + yaygın hakaret/spam)
const badWords = [
  "ananı", "amcık", "amına", "amcığı", "piç", "orospu", "orospu çocuğu", "sürtük",
  "yarrağım", "yarak", "kahpe", "şerefsiz", "göt", "götveren",
  "pezevenk", "ibne", "mal", "salak", "aptal", "gerizekalı", "oç",
  "amcıklar", "götünü", "siktir", "sikti", "siktim", "sikik", "sikeyim",
  "piçkurusu", "fuck", "shit", "bitch", "asshole", "bastard", "dick",
  "cunt", "motherfucker", "fucker", "damn", "piss", "cock", "pussy",
  "slut", "whore", "douche", "xxx", "porn", "sex", "nigger", "fag",
  "retard", "dumb", "stupid"
];

// Regex pattern'ler
const xssPattern = /<script.*?>.*?<\/script.*?>/gi;
const htmlTagPattern = /<\/?[\w\s="/.':;#-\/]+>/gi;
const sqlInjectionPattern = /(\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|CREATE)\b)/gi;

// Rate limit & cooldown ayarları
const RATE_LIMIT_MS = 60 * 1000; // 1 dakika
let lastSubmitTime = 0;

// Spam için duplicate kontrolü
const submittedComments = new Set();
const submittedSuggestions = new Set();

// IP kara liste simülasyonu (localStorage)
const ipBlacklistKey = 'ipBlacklist';
const userIP = 'localDummyIP'; // Gerçek IP backend ile alınmalı

// Honeypot bot tuzağı alanı
const honeypotField = document.getElementById('hpField');

// DOM elemanları
const commentsList = document.getElementById('commentsList');
const suggestionsList = document.getElementById('suggestionsList');
const commentForm = document.getElementById('commentForm');
const suggestionForm = document.getElementById('suggestionForm');
const commentNameInput = document.getElementById('commentName');
const commentTextInput = document.getElementById('commentText');
const suggestionNameInput = document.getElementById('suggestionName');
const suggestionTextInput = document.getElementById('suggestionText');
const submitButtons = document.querySelectorAll('form button');
const messageBox = document.getElementById('messageBox');

// Karmaşık karakter kontrolü ve filtreleme
function isCleanInput(text) {
  if (
    xssPattern.test(text) ||
    htmlTagPattern.test(text) ||
    sqlInjectionPattern.test(text)
  ) return false;

  return true;
}

// Kötü kelime kontrolü
function containsBadWords(text) {
  const lowered = text.toLowerCase();
  return badWords.some(word => lowered.includes(word));
}

// Basit captcha sistemi
const captchaQuestion = document.getElementById('captchaQuestion');
const captchaInput = document.getElementById('captchaInput');
let captchaAnswer = 0;
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  captchaAnswer = a + b;
  captchaQuestion.textContent = `Lütfen ${a} + ${b} işleminin sonucunu yazın:`;
}
generateCaptcha();

// Rate limit kontrol
function canSubmit() {
  return Date.now() - lastSubmitTime > RATE_LIMIT_MS;
}

// Duplicate kontrol
function isDuplicate(containerSet, name, text) {
  const key = `${name.toLowerCase()}|${text.toLowerCase()}`;
  return containerSet.has(key);
}
function addDuplicate(containerSet, name, text) {
  const key = `${name.toLowerCase()}|${text.toLowerCase()}`;
  containerSet.add(key);
}

// IP kara liste kontrolü
function isIPBlacklisted(ip) {
  const blacklist = JSON.parse(localStorage.getItem(ipBlacklistKey)) || [];
  return blacklist.includes(ip);
}
function blacklistIP(ip) {
  const blacklist = JSON.parse(localStorage.getItem(ipBlacklistKey)) || [];
  if (!blacklist.includes(ip)) {
    blacklist.push(ip);
    localStorage.setItem(ipBlacklistKey, JSON.stringify(blacklist));
  }
}

// Mesaj gösterme animasyonu
function showMessage(text, isError = false) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.style.color = isError ? '#ff5555' : '#55ff55';
  messageBox.style.opacity = '1';
  setTimeout(() => {
    messageBox.style.opacity = '0';
  }, 4000);
}

// Buton kilitleme ve animasyon
function disableButtons(seconds = 30) {
  submitButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  });
  setTimeout(() => {
    submitButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    });
  }, seconds * 1000);
}

// Form gönderme ortak fonksiyonu
function handleSubmit(event, containerSet, containerElement, nameInput, textInput, formType) {
  event.preventDefault();

  // Honeypot kontrolü
  if (honeypotField.value.trim() !== '') {
    showMessage('Bot tespit edildi, işlem engellendi!', true);
    return;
  }

  // Rate limit
  if (!canSubmit()) {
    showMessage('Lütfen 1 dakika bekleyip tekrar deneyin.', true);
    return;
  }

  // Alan boşlukları
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  const captcha = captchaInput.value.trim();

  if (!name || !text || !captcha) {
    showMessage('Lütfen tüm alanları doldurun.', true);
    return;
  }

  // Güvenlik kontrolü
  if (!isCleanInput(name) || !isCleanInput(text)) {
    showMessage('Güvenli olmayan karakterler tespit edildi.', true);
    return;
  }

  // Küfür ve kötü kelime kontrolü
  if (containsBadWords(name) || containsBadWords(text)) {
    showMessage('Uygunsuz kelimeler içeriyor.', true);
    return;
  }

  // Uzunluk kontrolü
  if (name.length > 30) {
    showMessage('İsim en fazla 30 karakter olabilir.', true);
    return;
  }
  if (text.length > 300) {
    showMessage(`${formType} en fazla 300 karakter olabilir.`, true);
    return;
  }

  // Duplicate kontrol
  if (isDuplicate(containerSet, name, text)) {
    showMessage('Aynı içerik daha önce gönderildi.', true);
    return;
  }

  // Captcha kontrolü
  if (parseInt(captcha) !== captchaAnswer) {
    showMessage('Captcha doğrulaması başarısız.', true);
    generateCaptcha();
    return;
  }

  // IP kara liste kontrolü
  if (isIPBlacklisted(userIP)) {
    showMessage('IP adresiniz engellenmiştir.', true);
    return;
  }

  // Başarılı gönderim
  lastSubmitTime = Date.now();
  addDuplicate(containerSet, name, text);

  // Yeni yorum/öneri elemanı oluştur
  const div = document.createElement('div');
  div.classList.add(formType === 'Yorum' ? 'comment' : 'suggestion');
  div.textContent = `${name}: ${text}`;
  containerElement.prepend(div);

  showMessage(`${formType} başarıyla gönderildi!`);

  // Formu temizle
  nameInput.value = '';
  textInput.value = '';
  captchaInput.value = '';
  generateCaptcha();

  // Butonları 30 saniye kilitle
  disableButtons(30);
}

// Event listenerlar
commentForm.addEventListener('submit', e => {
  handleSubmit(e, submittedComments, commentsList, commentNameInput, commentTextInput, 'Yorum');
});
suggestionForm.addEventListener('submit', e => {
  handleSubmit(e, submittedSuggestions, suggestionsList, suggestionNameInput, suggestionTextInput, 'Öneri');
});

// Zoom fonksiyonları (harita resmi)
const zoomImg = document.getElementById('zoomImg');
const zoomBtn = document.getElementById('zoomBtn');

zoomBtn.addEventListener('click', () => {
  zoomImg.classList.toggle('zoomed');
  zoomBtn.textContent = zoomImg.classList.contains('zoomed') ? 'Uzaklaştır' : 'Yakınlaştır';
});
zoomImg.addEventListener('click', () => {
  zoomImg.classList.toggle('zoomed');
  zoomBtn.textContent = zoomImg.classList.contains('zoomed') ? 'Uzaklaştır' : 'Yakınlaştır';
});
