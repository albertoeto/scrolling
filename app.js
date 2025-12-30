const feed = document.getElementById("feed");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlay-content");
const backBtn = document.getElementById("back");
const viewStudiedBtn = document.getElementById("view-studied");
const studiedList = document.getElementById("studied-list");

let files = [];
let pointer = 0;
const BATCH = 4;
const studied = new Set(JSON.parse(localStorage.getItem("studied") || "[]"));

// Estrae l'ID Google Drive dall'URL
function getDriveId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : url;
}

// Carica il JSON delle risorse
fetch("resources.json")
  .then(r => r.json())
  .then(data => {
    files = data.flatMap(book => book.chapters.flatMap(ch => ch.resources))
                .filter(f => !studied.has(getDriveId(f.src)));
    shuffle(files);
    loadMore();
    window.addEventListener("scroll", onScroll);
  })
  .catch(err => console.error("Errore caricamento resources.json", err));

function shuffle(a){ return a.sort(()=>Math.random()-0.5); }

function onScroll(){
  if(window.innerHeight + scrollY > document.body.offsetHeight - 700) loadMore();
}

function loadMore(){
  files.slice(pointer, pointer + BATCH).forEach(renderPost);
  pointer += BATCH;
}

function renderPost(file){
  const post = document.createElement("div");
  post.className = "post";

  const mediaBox = document.createElement("div");
  mediaBox.className = "media-box";

  // Tutte le risorse Google Drive → iframe /preview
  if(file.type === "image"){
    const iframe = document.createElement("iframe");
    iframe.src = file.src; // es. /preview di Drive
    iframe.style.width = "100%";
    iframe.style.height = "70vh";
    iframe.style.border = "none";
    mediaBox.appendChild(iframe);
  } else {
    const iframe = document.createElement("iframe");
    iframe.src = file.src;
    iframe.style.width = "100%";
    iframe.style.height = "70vh";
    iframe.style.border = "none";
    if(file.type === "pdf") iframe.className = "pdf-frame";
    mediaBox.appendChild(iframe);
  }

  post.appendChild(mediaBox);

  const actions = document.createElement("div");
  actions.className = "actions";

  const studyBtn = document.createElement("div");
  studyBtn.className = "action-btn";
  studyBtn.textContent = "📖 Studiato";
  studyBtn.onclick = () => {
    const id = getDriveId(file.src);
    studied.add(id);
    localStorage.setItem("studied", JSON.stringify([...studied]));
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

// FULLSCREEN → sempre iframe /preview
function openFullscreen(file){
  overlayContent.innerHTML = "";
  const node = document.createElement("iframe");
  node.src = file.src; // /preview di Drive
  node.style.width = "90vw";
  node.style.height = "90vh";
  node.style.border = "none";
  overlayContent.appendChild(node);
  overlay.classList.remove("hidden");
}

backBtn.onclick = () => overlay.classList.add("hidden");

// VISUALIZZA STUDIATI
viewStudiedBtn.onclick = () => {
  studiedList.innerHTML = "";
  studied.forEach(id => {
    const div = document.createElement("div");
    div.textContent = id;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Rimuovi";
    removeBtn.onclick = () => {
      studied.delete(id);
      localStorage.setItem("studied", JSON.stringify([...studied]));
      div.remove();
    };
    div.appendChild(removeBtn);
    studiedList.appendChild(div);
  });
  studiedList.classList.toggle("hidden");
};
