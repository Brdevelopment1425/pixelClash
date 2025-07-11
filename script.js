// script.js - Giriş, Yorum, Öneri, Zoom ve Menü İşlemleri

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("hidden"); // gizle
    // istersen 500ms sonra tamamen kaldır:
    setTimeout(() => {
      if(loader.parentNode) loader.parentNode.removeChild(loader);
    }, 500);
  }
});

  // DOM Elemanları
  const loginBtn = document.getElementById("login-btn");
  const loginModal = document.getElementById("login-modal");
  const closeLogin = document.getElementById("close-login");
  const emailForm = document.getElementById("email-form");
  const codeForm = document.getElementById("code-form");
  const emailInput = document.getElementById("email-input");
  const codeInput = document.getElementById("code-input");
  const loginMessage = document.getElementById("login-message");
  const userArea = document.getElementById("user-area");
  const userMenu = document.getElementById("user-menu");
  const userEmailSpan = document.getElementById("user-email");
  const adminPanelLink = document.getElementById("admin-panel-link");
  const logoutBtn = document.getElementById("logout-btn");

  // Zoom controls
  const countryImg = document.getElementById("country-img");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");
  const zoomResetBtn = document.getElementById("zoom-reset");

  // Comment & Suggestion
  const commentForm = document.getElementById("comment-form");
  const suggestionForm = document.getElementById("suggestion-form");
  const commentsList = document.getElementById("comments-list");
  const suggestionsList = document.getElementById("suggestions-list");

  // Message Box
  const messageBox = document.getElementById("messageBox");

  // Kullanıcı bilgisi
  let loggedIn = false;
  let currentUserEmail = null;

  // Zoom state
  let zoomLevel = 1;
  const ZOOM_STEP = 0.15;
  const ZOOM_MAX = 3;
  const ZOOM_MIN = 0.5;

  // Göster/gizle mesaj kutusu
  function showMessage(text, duration = 3000) {
    messageBox.textContent = text;
    messageBox.style.display = "block";
    setTimeout(() => (messageBox.style.display = "none"), duration);
  }

  // Kullanıcı menüsünü toggle et
  userArea.addEventListener("click", (e) => {
    if (!loggedIn) return;
    if (e.target.id === "login-btn") return; // Giriş butonu ise ignore
    userMenu.classList.toggle("hidden");
  });

  // Menü dışına tıklayınca kullanıcı menüsünü gizle
  document.addEventListener("click", (e) => {
    if (!userArea.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  // Giriş modal aç/kapa
  loginBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
    loginMessage.textContent = "";
    emailForm.classList.remove("hidden");
    codeForm.classList.add("hidden");
  });
  closeLogin.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    emailInput.value = "";
    codeInput.value = "";
  });

  // Kod gönderme formu
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (email.toLowerCase() !== "brdevelopment2@gmail.com") {
      loginMessage.textContent = "Sadece admin gmail ile giriş yapılabilir.";
      return;
    }
    try {
      loginMessage.textContent = "Kod gönderiliyor...";
      const res = await fetch("/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        loginMessage.textContent = "Kod Gmail adresinize gönderildi.";
        emailForm.classList.add("hidden");
        codeForm.classList.remove("hidden");
      } else {
        const err = await res.text();
        loginMessage.textContent = "Hata: " + err;
      }
    } catch (err) {
      loginMessage.textContent = "Sunucu hatası, tekrar deneyin.";
    }
  });

  // Kod doğrulama formu
  codeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const code = codeInput.value.trim();
    if (code.length !== 6) {
      loginMessage.textContent = "6 haneli kodu doğru girin.";
      return;
    }
    try {
      loginMessage.textContent = "Doğrulanıyor...";
      const res = await fetch("/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        loggedIn = true;
        currentUserEmail = email;
        loginModal.classList.add("hidden");
        updateUserUI();
        showMessage("Başarıyla giriş yaptınız.");
      } else {
        const err = await res.text();
        loginMessage.textContent = "Hata: " + err;
      }
    } catch (err) {
      loginMessage.textContent = "Sunucu hatası, tekrar deneyin.";
    }
  });

  // Kullanıcı arayüzünü güncelle
  function updateUserUI() {
    if (loggedIn) {
      loginBtn.style.display = "none";
      userMenu.classList.add("hidden");
      userEmailSpan.textContent = currentUserEmail;
      userArea.querySelector("img").src =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(currentUserEmail) +
        "&background=3498db&color=fff&rounded=true&size=48";
      userMenu.classList.remove("hidden");
    } else {
      loginBtn.style.display = "inline-block";
      userMenu.classList.add("hidden");
      userEmailSpan.textContent = "";
    }
  }

  // Admin panel link tıklaması
  adminPanelLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (!loggedIn) {
      showMessage("Önce giriş yapmalısınız.");
      return;
    }
    window.location.href = "/admin"; // Admin panel yolu (sunucu tarafında ayarla)
  });

  // Çıkış butonu
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await fetch("/logout");
      loggedIn = false;
      currentUserEmail = null;
      updateUserUI();
      showMessage("Başarıyla çıkış yaptınız.");
    } catch {
      showMessage("Çıkış yapılamadı.");
    }
  });

  // Zoom fonksiyonları
  function applyZoom() {
    countryImg.style.transform = `scale(${zoomLevel})`;
  }

  zoomInBtn.addEventListener("click", () => {
    if (zoomLevel < ZOOM_MAX) {
      zoomLevel += ZOOM_STEP;
      applyZoom();
    }
  });

  zoomOutBtn.addEventListener("click", () => {
    if (zoomLevel > ZOOM_MIN) {
      zoomLevel -= ZOOM_STEP;
      applyZoom();
    }
  });

  zoomResetBtn.addEventListener("click", () => {
    zoomLevel = 1;
    applyZoom();
  });

  // Yorum ve önerileri localStorage'da tutuyoruz
  function loadComments() {
    const data = JSON.parse(localStorage.getItem("comments") || "[]");
    commentsList.innerHTML = "";
    data.forEach(({ name, text }) => {
      const div = document.createElement("div");
      div.className = "comment-item";
      div.innerHTML = `<div class="comment-name">${sanitize(name)}</div><div class="comment-text">${sanitize(text)}</div>`;
      commentsList.appendChild(div);
    });
  }
  function loadSuggestions() {
    const data = JSON.parse(localStorage.getItem("suggestions") || "[]");
    suggestionsList.innerHTML = "";
    data.forEach(({ name, text }) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `<div class="suggestion-name">${sanitize(name)}</div><div class="suggestion-text">${sanitize(text)}</div>`;
      suggestionsList.appendChild(div);
    });
  }

  // Basit XSS ve küfür filtresi (örnek)
  const forbiddenWords = ["küfür1", "küfür2", "örnekkelime"]; // Gerçek küfürler eklenmeli

  function sanitize(str) {
    let safe = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    forbiddenWords.forEach((w) => {
      const re = new RegExp(w, "gi");
      safe = safe.replace(re, "*".repeat(w.length));
    });
    return safe;
  }

  // Formlar
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!loggedIn) {
      showMessage("Yorum yapabilmek için giriş yapmalısınız.");
      return;
    }
    const name = commentForm["comment-name"].value.trim();
    const text = commentForm["comment-text"].value.trim();
    if (!name || !text) {
      showMessage("Lütfen adınızı ve yorumunuzu yazınız.");
      return;
    }
    if (text.length > 500) {
      showMessage("Yorum çok uzun.");
      return;
    }
    const comments = JSON.parse(localStorage.getItem("comments") || "[]");
    comments.push({ name, text });
    localStorage.setItem("comments", JSON.stringify(comments));
    commentForm.reset();
    loadComments();
    showMessage("Yorumunuz kaydedildi.");
  });

  suggestionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!loggedIn) {
      showMessage("Öneri gönderebilmek için giriş yapmalısınız.");
      return;
    }
    const name = suggestionForm["suggestion-name"].value.trim();
    const text = suggestionForm["suggestion-text"].value.trim();
    if (!name || !text) {
      showMessage("Lütfen adınızı ve önerinizi yazınız.");
      return;
    }
    if (text.length > 500) {
      showMessage("Öneri çok uzun.");
      return;
    }
    const suggestions = JSON.parse(localStorage.getItem("suggestions") || "[]");
    suggestions.push({ name, text });
    localStorage.setItem("suggestions", JSON.stringify(suggestions));
    suggestionForm.reset();
    loadSuggestions();
    showMessage("Öneriniz kaydedildi.");
  });

  // Sayfa yüklendiğinde yorumları ve önerileri yükle
  loadComments();
  loadSuggestions();

  // Başlangıçta kullanıcı arayüzü güncelle
  updateUserUI();
});
