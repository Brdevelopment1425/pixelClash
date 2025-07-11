// Yükleme ekranı kaldır
window.addEventListener("load", () => {
  document.getElementById("loader").style.display = "none";
});

// HTML escape
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Yorumlar
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");
const commentAuthor = document.getElementById("commentAuthor");
const commentsList = document.getElementById("commentsList");

function loadComments() {
  let comments = JSON.parse(localStorage.getItem("comments")) || [];
  commentsList.innerHTML = "";
  comments.forEach((c) => {
    const div = document.createElement("div");
    div.classList.add("comment");
    div.innerHTML = `
      <div><strong>${escapeHtml(c.author)}</strong></div>
      <div>${escapeHtml(c.text)}</div>
    `;
    commentsList.appendChild(div);
  });
}

commentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const author = commentAuthor.value.trim();
  const text = commentInput.value.trim();
  if (!author || !text) return;
  const comments = JSON.parse(localStorage.getItem("comments")) || [];
  comments.push({ author, text });
  localStorage.setItem("comments", JSON.stringify(comments));
  commentAuthor.value = "";
  commentInput.value = "";
  loadComments();
});

loadComments();

// Öneriler
const suggestionForm = document.getElementById("suggestionForm");
const suggestionInput = document.getElementById("suggestionInput");
const suggestionAuthor = document.getElementById("suggestionAuthor");
const suggestionsList = document.getElementById("suggestionsList");

function loadSuggestions() {
  let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
  suggestionsList.innerHTML = "";
  suggestions.forEach((s) => {
    const div = document.createElement("div");
    div.classList.add("suggestion");
    div.innerHTML = `
      <div><strong>${escapeHtml(s.author)}</strong></div>
      <div>${escapeHtml(s.text)}</div>
    `;
    suggestionsList.appendChild(div);
  });
}

suggestionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const author = suggestionAuthor.value.trim();
  const text = suggestionInput.value.trim();
  if (!author || !text) return;
  const suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
  suggestions.push({ author, text });
  localStorage.setItem("suggestions", JSON.stringify(suggestions));
  suggestionAuthor.value = "";
  suggestionInput.value = "";
  loadSuggestions();
});

loadSuggestions();
