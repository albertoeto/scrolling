const feed = document.getElementById("feed");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlay-content");
const backBtn = document.getElementById("back");

let files = [];
let pointer = 0;
const BATCH = 4;
const studied = new Set(JSON.parse(localStorage.getItem("studied") || "[]"));

function getDriveId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : url;
}

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

  const iframe = document.createElement("iframe");
  iframe.src = file.src;
  iframe.style.width = "100%";
  iframe.style.border = "none";

  if(file.type === "image" || file.type === "video"){
    const w = feed.offsetWidth;
    iframe.style.height = `${w*9/16}px`; // formato 16:9
  } else if(file.type === "audio"){
    iframe.style.height = "80px";
  } else {
    iframe.style.height = "70vh"; // PDF e link
    if(file.type === "pdf") iframe.className = "pdf-frame";
  }

  mediaBox.appendChild(iframe);
  post.appendChild(mediaBox);

  const actions = document.createElement("div");
  actions.className = "actions";

  // SOLO ICONE: 📖 per Studiato
  const studyBtn = document.createElement("div");
  studyBtn.className = "action-btn";
  studyBtn.textContent = "📖"; // icona senza testo
  studyBtn.onclick = () => {
    studied.add(getDriveId(file.src));
    localStorage.setItem("studied", JSON.stringify([...studied]));
    post.remove();
  };

  // SOLO ICONE: ⤢ per Espandi
  const expandBtn = document.createElement("div");
  expandBtn.className = "action-btn";
  expandBtn.textContent = "⤢"; // icona senza testo
  expandBtn.onclick = () => openFullscreen(file);

  actions.append(studyBtn, expandBtn);
  post.appendChild(actions);

  feed.appendChild(post);
}

function openFullscreen(file){
  overlayContent.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = file.src;
  iframe.style.width = "90vw";
  iframe.style.border = "none";

  if(file.type === "image" || file.type === "video"){
    const w = window.innerWidth * 0.9; 
    iframe.style.height = `${w*9/16}px`; // 16:9
  } else if(file.type === "audio"){
    iframe.style.height = "80px";
  } else {
    iframe.style.height = "90vh";
  }

  overlayContent.appendChild(iframe);
  overlay.classList.remove("hidden");
}

backBtn.onclick = () => overlay.classList.add("hidden");
