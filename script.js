// Loader gizle
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => loader.style.display = 'none', 500);
  document.body.style.overflowY = 'auto'; // yükleme bitince kaydırma aç
});

// Menü tıklama => smooth scroll
function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Mobil menüyü kapat
  const mobileNav = document.querySelector('nav.mobile-nav');
  const hamburger = document.querySelector('.hamburger');
  if (mobileNav.classList.contains('show')) {
    mobileNav.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
  }
}

// Hamburger toggle
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('nav.mobile-nav');
hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('show');
  hamburger.setAttribute('aria-expanded', isOpen);
});
hamburger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const isOpen = mobileNav.classList.toggle('show');
    hamburger.setAttribute('aria-expanded', isOpen);
  }
});

// Yorum sistemi
const commentsList = document.getElementById('commentsList');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentAuthor = document.getElementById('commentAuthor');

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  })[m]);
}

function loadComments() {
  let comments = JSON.parse(localStorage.getItem('comments')) || [];
  commentsList.innerHTML = '';
  if (comments.length === 0) {
    commentsList.innerHTML = '<p style="color:#666; font-style: italic;">Henüz yorum yok.</p>';
    return;
  }
  comments.forEach(c => {
    const div = document.createElement('div');
    div.classList.add('comment');
    div.innerHTML = `
      <div class="comment-author">${escapeHtml(c.author)}</div>
      <div class="comment-text">${escapeHtml(c.text)}</div>
    `;
    commentsList.appendChild(div);
  });
}

commentForm.addEventListener('submit', e => {
  e.preventDefault();
  const author = commentAuthor.value.trim();
  const text = commentInput.value.trim();
  if (!author) return alert('Lütfen isminizi girin.');
  if (!text) return alert('Lütfen yorumunuzu yazın.');

  let comments = JSON.parse(localStorage.getItem('comments')) || [];
  comments.push({ author, text });
  localStorage.setItem('comments', JSON.stringify(comments));
  commentInput.value = '';
  commentAuthor.value = '';
  loadComments();
});

loadComments();

// Zoom & sürükleme özellikleri
const img = document.getElementById('zoomImg');
const container = document.getElementById('zoomContainer');
let scale = 1, translateX = 0, translateY = 0;
let isDragging = false, startX, startY;

function updateTransform() {
  img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

container.addEventListener('wheel', e => {
  e.preventDefault();

  const rect = img.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  const wheelDelta = e.deltaY < 0 ? 0.1 : -0.1;
  let newScale = Math.min(Math.max(0.5, scale + wheelDelta), 4);

  const dx = (offsetX - translateX) / scale;
  const dy = (offsetY - translateY) / scale;

  translateX -= dx * (newScale - scale);
  translateY -= dy * (newScale - scale);

  scale = newScale;
  updateTransform();
}, { passive: false });

container.addEventListener('mousedown', e => {
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - translateX;
  startY = e.clientY - translateY;
  img.style.cursor = 'grabbing';
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  img.style.cursor = 'grab';
});
container.addEventListener('mouseleave', () => {
  isDragging = false;
  img.style.cursor = 'grab';
});
container.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  translateX = e.clientX - startX;
  translateY = e.clientY - startY;
  updateTransform();
});

// Dokunmatik zoom ve sürükleme (mobil)
let lastTouchDist = null;

function getTouchDistance(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

container.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    lastTouchDist = getTouchDistance(e.touches[0], e.touches[1]);
  }
}, { passive: true });

container.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const newDist = getTouchDistance(e.touches[0], e.touches[1]);
    const distDelta = newDist - lastTouchDist;

    let newScale = scale + distDelta * 0.005;
    newScale = Math.min(Math.max(0.5, newScale), 4);

    // Scale değişimini ortalamaya göre yap
    const rect = img.getBoundingClientRect();
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    const offsetX = midX - rect.left;
    const offsetY = midY - rect.top;

    const dx = (offsetX - translateX) / scale;
    const dy = (offsetY - translateY) / scale;

    translateX -= dx * (newScale - scale);
    translateY -= dy * (newScale - scale);

    scale = newScale;
    updateTransform();

    lastTouchDist = newDist;
  }
}, { passive: false });
