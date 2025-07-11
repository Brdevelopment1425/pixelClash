// script.js
document.getElementById("comment-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ad = document.getElementById("comment-name").value.trim();
  const mesaj = document.getElementById("comment-text").value.trim();
  if (ad && mesaj) {
    const res = await fetch("/add-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, mesaj }),
    });
    if (res.ok) alert("Yorum kaydedildi!");
  }
});

document.getElementById("suggestion-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ad = document.getElementById("suggestion-name").value.trim();
  const mesaj = document.getElementById("suggestion-text").value.trim();
  if (ad && mesaj) {
    const res = await fetch("/add-suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad, mesaj }),
    });
    if (res.ok) alert("Öneri kaydedildi!");
  }
});

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  // 3 saniye sonra loader gizlenip içerik gösterilecek
  setTimeout(() => {
    loader.classList.add("hidden");
    setTimeout(() => {
      loader.remove();
      content.style.display = "block";
    }, 600); // opacity geçişi
  }, 3000);
});



// Menü açma/kapama için checkbox zaten var, ekstra js gerekmez.

// Profil dropdown menü toggle (mobilde daha iyi kullanım için)
const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");

if (profileBtn && profileDropdown) {
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display === "flex" ? "none" : "flex";
  });
  window.addEventListener("click", () => {
    profileDropdown.style.display = "none";
  });
}

// Zoom işlemleri
const countryImage = document.getElementById("country-image");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const resetZoomBtn = document.getElementById("reset-zoom");

let currentScale = 1;
const scaleStep = 0.1;
const maxScale = 3;
const minScale = 0.5;

function applyScale() {
  countryImage.style.transform = `scale(${currentScale})`;
}

if (zoomInBtn) {
  zoomInBtn.addEventListener("click", () => {
    if (currentScale < maxScale) {
      currentScale = +(currentScale + scaleStep).toFixed(2);
      applyScale();
    }
  });
}
if (zoomOutBtn) {
  zoomOutBtn.addEventListener("click", () => {
    if (currentScale > minScale) {
      currentScale = +(currentScale - scaleStep).toFixed(2);
      applyScale();
    }
  });
}
if (resetZoomBtn) {
  resetZoomBtn.addEventListener("click", () => {
    currentScale = 1;
    applyScale();
  });
}

// Basit yorum sistemi (localStorage tabanlı)
const commentForm = document.getElementById("comment-form");
const commentList = document.getElementById("comment-list");

function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderComments() {
  const comments = JSON.parse(localStorage.getItem("comments") || "[]");
  commentList.innerHTML = "";
  comments.forEach(({name, text}) => {
    const div = document.createElement("div");
    div.className = "comment-item";
    div.innerHTML = `<strong>${sanitizeInput(name)}</strong><p>${sanitizeInput(text)}</p>`;
    commentList.appendChild(div);
  });
}

if (commentForm) {
  commentForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = commentForm["comment-name"].value.trim();
    const text = commentForm["comment-text"].value.trim();

    if (!name || !text) return alert("Lütfen isim ve yorum giriniz.");

    // Küfür filtresi basit örnek:
    const forbiddenWords = ["küfür1", "küfür2", "örnek"];
    const lowerText = text.toLowerCase();
    if (forbiddenWords.some(word => lowerText.includes(word))) {
      return alert("Yorumunuzda uygunsuz kelimeler var.");
    }

    const comments = JSON.parse(localStorage.getItem("comments") || "[]");
    comments.push({name, text});
    localStorage.setItem("comments", JSON.stringify(comments));
    commentForm.reset();
    renderComments();
  });
}
renderComments();

// Basit öneri sistemi (localStorage tabanlı)
const suggestionForm = document.getElementById("suggestion-form");
const suggestionList = document.getElementById("suggestion-list");

if (suggestionForm) {
  suggestionForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = suggestionForm["suggestion-name"].value.trim();
    const text = suggestionForm["suggestion-text"].value.trim();

    if (!name || !text) return alert("Lütfen isim ve öneri giriniz.");

    // Küfür filtresi aynı şekilde
    const forbiddenWords = ["küfür1", "küfür2", "örnek"];
    const lowerText = text.toLowerCase();
    if (forbiddenWords.some(word => lowerText.includes(word))) {
      return alert("Önerinizde uygunsuz kelimeler var.");
    }

    const suggestions = JSON.parse(localStorage.getItem("suggestions") || "[]");
    suggestions.push({name, text});
    localStorage.setItem("suggestions", JSON.stringify(suggestions));
    suggestionForm.reset();
    renderSuggestions();
  });
}

function renderSuggestions() {
  const suggestions = JSON.parse(localStorage.getItem("suggestions") || "[]");
  suggestionList.innerHTML = "";
  suggestions.forEach(({name, text}) => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `<strong>${sanitizeInput(name)}</strong><p>${sanitizeInput(text)}</p>`;
    suggestionList.appendChild(div);
  });
}
renderSuggestions();

// Giriş butonu, profil açma kapama vs.
// Buraya Gmail login vs. entegrasyon kodu eklenebilir (API, OAuth vs.)

// Basit örnek profil açma kapama menüsü hazır (üstte)

