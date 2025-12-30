const feed = document.getElementById("feed");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlay-content");
const backBtn = document.getElementById("back");

let files = [];
let pointer = 0;
const BATCH = 4;
const studied = new Set(JSON.parse(localStorage.getItem("studied") || "[]"));

// Carica il JSON delle risorse
fetch("resources.json")
  .then(r => r.json())
  .then(data => {
    files = data.filter(f => !studied.has(f.src));
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

  if(file.type === "link"){
    const iframe = document.createElement("iframe");
    iframe.src = file.src;
    iframe.style.width = "100%";
    iframe.style.height = "70vh";
    mediaBox.appendChild(iframe);
  } else if(file.type === "video"){
    const vid = document.createElement("video");
    vid.src = file.src;
    vid.controls = true;
    mediaBox.appendChild(vid);
  } else if(file.type === "image"){
    const img = document.createElement("img");
    img.src = file.src;
    mediaBox.appendChild(img);
  } else if(file.type === "pdf"){
    const iframe = document.createElement("iframe");
    iframe.src = file.src;
    iframe.className = "pdf-frame";
    iframe.style.width = "100%";
    iframe.style.height = "70vh";
    mediaBox.appendChild(iframe);
  } else if(file.type === "audio"){
    const aud = document.createElement("audio");
    aud.src = file.src;
    aud.controls = true;
    mediaBox.appendChild(aud);
  }

  post.appendChild(mediaBox);

  const actions = document.createElement("div");
  actions.className = "actions";

  const studyBtn = document.createElement("div");
  studyBtn.className = "action-btn";
  studyBtn.textContent = "📖 Studiato";
  studyBtn.onclick = () => {
    studied.add(file.src);
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

function openFullscreen(file){
  overlayContent.innerHTML = "";
  let node;

  if(file.type === "link" || file.type === "pdf"){
    node = document.createElement("iframe");
    node.src = file.src;
    node.style.width = "90vw";
    node.style.height = "90vh";
    node.style.border = "none";
  } else if(file.type === "video"){
    node = document.createElement("video");
    node.src = file.src;
    node.controls = true;
    node.style.maxWidth = "90vw";
    node.style.maxHeight = "90vh";
  } else if(file.type === "image"){
    node = document.createElement("img");
    node.src = file.src;
    node.style.maxWidth = "90vw";
    node.style.maxHeight = "90vh";
  } else if(file.type === "audio"){
    node = document.createElement("audio");
    node.src = file.src;
    node.controls = true;
    node.style.width = "90vw";
  }

  overlayContent.appendChild(node);
  overlay.classList.remove("hidden");
}

backBtn.onclick = () => overlay.classList.add("hidden");
