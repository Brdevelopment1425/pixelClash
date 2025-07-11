// Hamburger Menü Toggle - PC & Mobil
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', !expanded);
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Zoom Kontrolleri
const img = document.getElementById('country-img');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomResetBtn = document.getElementById('zoom-reset');
let currentScale = 1;

function setScale(scale) {
  if (scale < 0.5) scale = 0.5;
  if (scale > 5) scale = 5;
  currentScale = scale;
  img.style.transform = `scale(${scale})`;
}

zoomInBtn.addEventListener('click', () => setScale(currentScale + 0.25));
zoomOutBtn.addEventListener('click', () => setScale(currentScale - 0.25));
zoomResetBtn.addEventListener('click', () => setScale(1));

// Yükleme ekranı gizleme
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
});

// Mesaj kutusu göster/gizle
const messageBox = document.getElementById('messageBox');
function showMessage(msg, duration = 3500) {
  messageBox.textContent = msg;
  messageBox.classList.add('show');
  setTimeout(() => messageBox.classList.remove('show'), duration);
}

// Yorumlar & Öneriler Yönetimi
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
const suggestionForm = document.getElementById('suggestion-form');
const suggestionsList = document.getElementById('suggestions-list');

const badWords = [
  "siktir", "anan", "orospu", "piç", "aptal", "mal", "gerizekalı", "şerefsiz",
  "salak", "kahbe", "ibne", "orospuçocuğu", "yarak", "yarakçı", "sikik",
  "amk", "amcık", "amına", "yarrak", "göt", "götveren", "orospu", "bok",
  "pezevenk", "piçkurusu", "puşt", "şerefsiz"
];

// Küfür kontrol fonksiyonu
function containsBadWord(text) {
  text = text.toLowerCase();
  return badWords.some(badWord => text.includes(badWord));
}

// Yorum formu submit
commentForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = commentForm['name'].value.trim();
  const comment = commentForm['comment'].value.trim();
  if (!name || !comment) {
    showMessage('Lütfen isim ve yorum alanlarını doldurun!');
    return;
  }
  if (containsBadWord(name) || containsBadWord(comment)) {
    showMessage('Yorumunuzda uygunsuz kelimeler var!');
    return;
  }
  addComment(name, comment);
  commentForm.reset();
  showMessage('Yorumunuz başarıyla gönderildi!');
});

function addComment(name, comment) {
  const div = document.createElement('div');
  div.classList.add('comment-item');
  div.style.marginBottom = '14px';
  div.innerHTML = `<strong>${escapeHTML(name)}</strong>: ${escapeHTML(comment)}`;
  commentsList.prepend(div);
}

// Öneri formu submit
suggestionForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = suggestionForm['name'].value.trim();
  const suggestion = suggestionForm['suggestion'].value.trim();
  if (!name || !suggestion) {
    showMessage('Lütfen isim ve öneri alanlarını doldurun!');
    return;
  }
  if (containsBadWord(name) || containsBadWord(suggestion)) {
    showMessage('Önerinizde uygunsuz kelimeler var!');
    return;
  }
  addSuggestion(name, suggestion);
  suggestionForm.reset();
  showMessage('Öneriniz başarıyla gönderildi!');
});

function addSuggestion(name, suggestion) {
  const div = document.createElement('div');
  div.classList.add('suggestion-item');
  div.style.marginBottom = '14px';
  div.innerHTML = `<strong>${escapeHTML(name)}</strong>: ${escapeHTML(suggestion)}`;
  suggestionsList.prepend(div);
}

// HTML escape güvenlik
function escapeHTML(text) {
  return text.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

// Sayfa yüklenirken animasyon göstermek için containerlara sınıf ekle
document.querySelectorAll('.section-container').forEach(el => {
  el.classList.add('fade-in-up');
});
