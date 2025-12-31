const feed = document.getElementById("studied-feed");
const studied = JSON.parse(localStorage.getItem("studied") || []);

fetch("resources.json")
  .then(r => r.json())
  .then(data => {
    const all = flattenResources(data);
    all.filter(r => studied.includes(r.id)).forEach(render);
  });

function flattenResources(data) {
  const out = [];
  data.forEach(book => {
    book.chapters.forEach(ch => {
      ch.resources.forEach(res => {
        const src = `resources/${book.slug}/${ch.slug}/${res.file}`;
        out.push({ ...res, src, id: src });
      });
    });
  });
  return out;
}

function render(file){
  const post = document.createElement("div");
  post.className = "post";
  post.appendChild(createMedia(file));

  const btn = document.createElement("div");
  btn.className = "remove-btn";
  btn.textContent = "✖";
  btn.onclick = () => {
    const updated = studied.filter(x => x !== file.id);
    localStorage.setItem("studied", JSON.stringify(updated));
    post.remove();
  };

  post.appendChild(btn);
  feed.appendChild(post);
}

function createMedia(file){
  const box = document.createElement("div");
  box.className = "media-box";
  let el;

  if(file.type === "image"){ el = new Image(); el.src = file.src; }
  else if(file.type === "video"){ el = document.createElement("video"); el.src=file.src; el.controls=true; }
  else if(file.type === "audio"){ el = document.createElement("audio"); el.src=file.src; el.controls=true; }
  else { el = document.createElement("iframe"); el.src=file.src; }

  box.appendChild(el);
  return box;
}
