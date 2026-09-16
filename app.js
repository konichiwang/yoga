const videos = [
  "bQa6VKPoyFw", "lsV286HgxPU", "XJqNw4MCj6M", "be6qClCSWtE",
  "1vbDzTMmk1U", "ymlSKZHZohY", "P9D1MapPJIc", "0jl_jNc1gfc",
  "Mp-Pzl9fdy4", "tkTQ64Ug57k", "Mc-kAjA383Y", "ZxM0BTZ8RkU",
  "p-IxKt0w-dI", "SQveY0CcmsE", "WRwVbvkcSZk"
];

const grid = document.querySelector("#videoGrid");
const template = document.querySelector("#videoCard");
const dialog = document.querySelector("#playerDialog");
const playerWrap = document.querySelector("#playerWrap");
const nowPlaying = document.querySelector("#nowPlaying");
let currentFilter = "all";

function durationFromTitle(title) {
  const match = title.match(/(?:^|\s)(\d{1,3})\s*(?:min(?:ute)?s?|minute)(?:\s|$)/i);
  return match ? Number(match[1]) : null;
}

function openVideo(id, title) {
  nowPlaying.textContent = title || "Your session";
  playerWrap.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${(title || "Yoga session").replaceAll('"', '&quot;')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  dialog.showModal();
}

function closeVideo() {
  dialog.close();
  playerWrap.replaceChildren();
}

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter").forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".card").forEach(card => {
    const minutes = Number(card.dataset.minutes) || null;
    card.hidden = filter === "quick" ? !(minutes && minutes < 20)
      : filter === "longer" ? !(minutes && minutes >= 20)
      : false;
  });
}

async function enrichCard(card, id) {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
    const response = await fetch(url);
    if (!response.ok) return;
    const data = await response.json();
    const minutes = durationFromTitle(data.title);
    card.querySelector(".title").textContent = data.title;
    card.querySelector(".teacher").textContent = data.author_name || "Yoga session";
    card.dataset.title = data.title;
    if (minutes) {
      card.dataset.minutes = minutes;
      card.querySelector(".duration").textContent = `${minutes} min`;
    }
    applyFilter(currentFilter);
  } catch (_) {
    // The session remains fully usable when YouTube metadata is unavailable.
  }
}

videos.forEach((id, index) => {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.id = id;
  card.dataset.title = `Yoga session ${index + 1}`;
  card.querySelector(".number").textContent = String(index + 1).padStart(2, "0");
  card.querySelector(".thumbnail").src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  card.querySelector(".thumbnail").alt = `Preview of yoga session ${index + 1}`;
  card.querySelector(".card-button").addEventListener("click", () => openVideo(id, card.dataset.title));
  grid.append(card);
  enrichCard(card, id);
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

document.querySelector("#randomButton").addEventListener("click", () => {
  const visible = [...document.querySelectorAll(".card:not([hidden])")];
  const pool = visible.length ? visible : [...document.querySelectorAll(".card")];
  const choice = pool[Math.floor(Math.random() * pool.length)];
  openVideo(choice.dataset.id, choice.dataset.title);
});

document.querySelector("#closePlayer").addEventListener("click", closeVideo);
dialog.addEventListener("click", event => { if (event.target === dialog) closeVideo(); });
dialog.addEventListener("close", () => playerWrap.replaceChildren());
