const feed = document.getElementById("feed");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlay-content");
const backBtn = document.getElementById("back");

const studied = new Set(JSON.parse(localStorage.getItem("studied") || "[]"));
let flatResources = [];
let pointer = 0;
const BATCH = 4;

fetch("resources.json")
  .then(r => r.json())
  .then(data => {
    flatResources = flattenResources(data)
      .filter(r => !studied.has(r.id));
    loadMore();
    window.addEventListener("scroll", onScroll);
  });

function flattenResources(data) {
  const out = [];
  data.forEach(book => {
    book.chapters.forEach(ch => {
      ch.resources.forEach(res => {
        const src = `resources/${book.slug}/${ch.slug}/${res.file}`;
        out.push({
          ...res,
          src,
          id: src,
          book: book.book,
          chapter: ch.chapter
        });
      });
    });
  });
  return out;
}

function onScroll(){
  if (innerHeight + scrollY > document.body.offsetHeight - 600)
    loadMore();
}

function loadMore(){
  flatResources
    .slice(pointer, pointer + BATCH)
    .forEach(renderPost);
  pointer += BATCH;
}

function renderPost(file){
  const post = document.createElement("div");
  post.className = "post";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${file.book} · ${file.chapter}`;

  post.appendChild(meta);
  post.appendChild(createMedia(file));

  const actions = document.createElement("div");
  actions.className = "actions";

  const studyBtn = document.createElement("div");
  studyBtn.className = "action-btn";
  studyBtn.textContent = "📖";
  studyBtn.onclick = () => {
    studied.add(file.id);
    localStorage.setItem("studied", JSON.stringify([...studied]));
    post.remove();
  };

  const expandBtn = document.createElement("div");
  expandBtn.className = "action-btn";
  expandBtn.textContent = "⤢";
  expandBtn.onclick = () => openFullscreen(file);

  actions.append(studyBtn, expandBtn);
  post.appendChild(actions);

  feed.appendChild(post);
}

function createMedia(file){
  const box = document.createElement("div");
  box.className = "media-box";
  let el;

  if(file.type === "image"){
    el = new Image();
    el.src = file.src;
  } else if(file.type === "video"){
    el = document.createElement("video");
    el.src = file.src;
    el.controls = true;
  } else if(file.type === "audio"){
    el = document.createElement("audio");
    el.src = file.src;
    el.controls = true;
  } else if(file.type === "pdf"){
    el = document.createElement("iframe");
    el.src = file.src;
  }

  box.appendChild(el);
  return box;
}

function openFullscreen(file){
  overlayContent.innerHTML = "";
  overlayContent.appendChild(createMedia(file));
  overlay.classList.remove("hidden");
}

backBtn.onclick = () => overlay.classList.add("hidden");
