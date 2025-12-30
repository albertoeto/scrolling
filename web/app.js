const feed = document.getElementById("feed");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlay-content");
const backBtn = document.getElementById("back");

let files = [];
let pointer = 0;
const BATCH = 4;

// URL backend locale
const BACKEND_URL = "http://localhost:3000";

fetch(`${BACKEND_URL}/api/files`)
  .then(r => r.json())
  .then(data => {
    files = data;
    loadMore();
    window.addEventListener("scroll", onScroll);
  })
  .catch(err => {
    console.error("Errore caricando backend:", err);
    feed.innerHTML = "<p style='text-align:center; color:red;'>Backend non disponibile. Avvia server locale.</p>";
  });

function onScroll() {
  if (window.innerHeight + scrollY > document.body.offsetHeight - 700) loadMore();
}

function loadMore() {
  files.slice(pointer, pointer + BATCH).forEach(renderPost);
  pointer += BATCH;
}

function renderPost(file) {
  const post = document.createElement("div");
  post.className = "post";

  const mediaBox = document.createElement("div");
  mediaBox.className = "media-box";

  const src = BACKEND_URL + "/media" + file.src;

  if (file.type === "image") {
    const img = document.createElement("img");
    img.src = src;
    mediaBox.appendChild(img);
  } else if (file.type === "pdf") {
    const iframe = document.createElement("iframe");
    iframe.className = "pdf-frame";
    iframe.src = src;
    mediaBox.appendChild(iframe);
  } else if (file.type === "video") {
    const vid = document.createElement("video");
    vid.src = src;
    vid.controls = true;
    mediaBox.appendChild(vid);
  } else if (file.type === "audio") {
    const aud = document.createElement("audio");
    aud.src = src;
    aud.controls = true;
    mediaBox.appendChild(aud);
  } else if (file.type === "link") {
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.style.width = "100%";
    iframe.style.height = "70vh";
    mediaBox.appendChild(iframe);
  }

  post.appendChild(mediaBox);

  const actions = document.createElement("div");
  actions.className = "actions";

  const studyBtn = document.createElement("div");
  studyBtn.className = "action-btn";
  studyBtn.textContent = "📖 Studiato";
  studyBtn.onclick = async () => {
    await fetch(`${BACKEND_URL}/api/studied`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src: file.src })
    });
    post.remove();
  };

  const expandBtn = document.createElement("div");
  expandBtn.className = "action-btn";
  expandBtn.textContent = "⤢ Espandi";
  expandBtn.onclick = () => openFullscreen(file);

  actions.append(studyBtn, expandBtn);
  post.appendChild(actions);

  feed.appendChild(post);
}

function openFullscreen(file) {
  overlayContent.innerHTML = "";
  const src = BACKEND_URL + "/media" + file.src;
  let node;

  if (file.type === "image") {
    node = document.createElement("img");
    node.src = src;
    node.style.maxWidth = "90vw";
    node.style.maxHeight = "90vh";
  } else if (file.type === "video") {
    node = document.createElement("video");
    node.src = src;
    node.controls = true;
    node.style.maxWidth = "90vw";
    node.style.maxHeight = "90vh";
  } else if (file.type === "pdf" || file.type === "link") {
    node = document.createElement("iframe");
    node.src = src;
    node.style.width = "90vw";
    node.style.height = "90vh";
    node.style.border = "none";
  } else if (file.type === "audio") {
    node = document.createElement("audio");
    node.src = src;
    node.controls = true;
    node.style.width = "90vw";
  }

  overlayContent.appendChild(node);
  overlay.classList.remove("hidden");
}

backBtn.onclick = () => overlay.classList.add("hidden");
