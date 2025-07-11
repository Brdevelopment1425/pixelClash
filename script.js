// --- Yüklenme ekranı ---
function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.style.transition = 'opacity 0.5s ease';
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

window.addEventListener('load', () => {
  hideLoader();
});

// --- Navbar hamburger ve dropdown ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');
const dropbtn = document.querySelector('.dropbtn');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Mobilde dropdown tıklamayla açılır
dropbtn.addEventListener('click', e => {
  if (window.innerWidth <= 768) {
    e.preventDefault();
    dropdownContent.classList.toggle('active');
  }
});

// --- Zoom butonu ---
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

// --- Kötü kelime filtresi ---
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

// Honeypot bot tuzağı alanları
const honeypotFieldComment = document.getElementById('hpField');
const honeypotFieldSuggestion = document.getElementById('hpFieldSuggestion');

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

const captchaQuestionSuggestion = document.getElementById('captchaQuestionSuggestion');
const captchaInputSuggestion = document.getElementById('captchaInputSuggestion');
let captchaAnswerSuggestion = 0;
function generateCaptchaSuggestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  captchaAnswerSuggestion = a + b;
  captchaQuestionSuggestion.textContent = `Lütfen ${a} + ${b} işleminin sonucunu yazın:`;
}
generateCaptchaSuggestion();

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

// Mesaj gösterme animasyonu
function showMessage(text, isError = false) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.style.backgroundColor = isError ? '#b33' : '#393';
  messageBox.style.opacity = '1';
  messageBox.style.pointerEvents = 'auto';
  setTimeout(() => {
    messageBox.style.opacity = '0';
    messageBox.style.pointerEvents = 'none';
  }, 4000);
}

// Yorum ekleme fonksiyonu
function addComment(name, text) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${escapeHtml(name)}</strong>: ${escapeHtml(text)}`;
  commentsList.prepend(div);
}

// Öneri ekleme fonksiyonu
function addSuggestion(name, text) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${escapeHtml(name)}</strong>: ${escapeHtml(text)}`;
  suggestionsList.prepend(div);
}

// HTML escape fonksiyonu
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Form submit eventleri
commentForm.addEventListener('submit', e => {
  e.preventDefault();

  // Honeypot kontrol
  if (honeypotFieldComment.value.trim() !== '') {
    showMessage('Bot işlemi tespit edildi.', true);
    return;
  }

  const name = commentNameInput.value.trim();
  const text = commentTextInput.value.trim();
  const captchaVal = parseInt(captchaInput.value.trim(), 10);

  if (!name || !text) {
    showMessage('Lütfen isim ve yorum alanlarını doldurun.', true);
    return;
  }

  if (!isCleanInput(name) || !isCleanInput(text)) {
    showMessage('Geçersiz karakterler veya kod içeriyor.', true);
    return;
  }

  if (containsBadWords(name) || containsBadWords(text)) {
    showMessage('Uygunsuz kelime içeriyor.', true);
    return;
  }

  if (captchaVal !== captchaAnswer) {
    showMessage('Captcha hatalı.', true);
    generateCaptcha();
    return;
  }

  if (!canSubmit()) {
    showMessage('Lütfen 1 dakika bekleyin.', true);
    return;
  }

  if (isDuplicate(submittedComments, name, text)) {
    showMessage('Aynı yorumu tekrar gönderemezsiniz.', true);
    return;
  }

  addComment(name, text);
  addDuplicate(submittedComments, name, text);

  commentForm.reset();
  generateCaptcha();
  lastSubmitTime = Date.now();

  showMessage('Yorumunuz başarıyla eklendi!');
});

suggestionForm.addEventListener('submit', e => {
  e.preventDefault();

  if (honeypotFieldSuggestion.value.trim() !== '') {
    showMessage('Bot işlemi tespit edildi.', true);
    return;
  }

  const name = suggestionNameInput.value.trim();
  const text = suggestionTextInput.value.trim();
  const captchaVal = parseInt(captchaInputSuggestion.value.trim(), 10);

  if (!name || !text) {
    showMessage('Lütfen isim ve öneri alanlarını doldurun.', true);
    return;
  }

  if (!isCleanInput(name) || !isCleanInput(text)) {
    showMessage('Geçersiz karakterler veya kod içeriyor.', true);
    return;
  }

  if (containsBadWords(name) || containsBadWords(text)) {
    showMessage('Uygunsuz kelime içeriyor.', true);
    return;
  }

  if (captchaVal !== captchaAnswerSuggestion) {
    showMessage('Captcha hatalı.', true);
    generateCaptchaSuggestion();
    return;
  }

  if (!canSubmit()) {
    showMessage('Lütfen 1 dakika bekleyin.', true);
    return;
  }

  if (isDuplicate(submittedSuggestions, name, text)) {
    showMessage('Aynı öneriyi tekrar gönderemezsiniz.', true);
    return;
  }

  addSuggestion(name, text);
  addDuplicate(submittedSuggestions, name, text);

  suggestionForm.reset();
  generateCaptchaSuggestion();
  lastSubmitTime = Date.now();

  showMessage('Öneriniz başarıyla eklendi!');
});
