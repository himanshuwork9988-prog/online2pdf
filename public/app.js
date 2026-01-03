const params = new URLSearchParams(window.location.search);
const tool = params.get("tool");

const titles = {
  "image-to-pdf": "Image to PDF",
  "merge-pdf": "Merge PDF",
  "compress-pdf": "Compress PDF",
  "split-pdf": "Split PDF",
  "rotate-pdf": "Rotate PDF",
  "watermark-pdf": "Add Watermark",
  "page-number-pdf": "Add Page Numbers",
  "protect-pdf": "Protect PDF",
  "unlock-pdf": "Unlock PDF",
  "jpg-png": "JPG ↔ PNG"
};

document.getElementById("toolTitle").innerText =
  titles[tool] || "PDF Tool";

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

let files = [];

/* CLICK UPLOAD */
dropZone.onclick = () => fileInput.click();

/* DRAG & DROP MULTIPLE */
dropZone.ondragover = e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
};

dropZone.ondragleave = () => dropZone.classList.remove("dragover");

dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  addFiles([...e.dataTransfer.files]);
};

/* FILE SELECT */
fileInput.onchange = () => addFiles([...fileInput.files]);

function addFiles(newFiles) {
  newFiles.forEach(f => files.push(f));
  renderFiles();
}

/* RENDER PREVIEW */
function renderFiles() {
  fileList.innerHTML = "";
  files.forEach((file, index) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.draggable = true;
    li.innerHTML = `<span>${file.name}</span> <span>☰</span>`;

    li.ondragstart = () => li.classList.add("dragging");
    li.ondragend = () => li.classList.remove("dragging");

    li.ondragover = e => e.preventDefault();
    li.ondrop = () => reorder(index);

    fileList.appendChild(li);
  });
}

function reorder(targetIndex) {
  const dragging = document.querySelector(".dragging");
  const fromIndex = [...fileList.children].indexOf(dragging);
  if (fromIndex === targetIndex) return;

  const moved = files.splice(fromIndex, 1)[0];
  files.splice(targetIndex, 0, moved);
  renderFiles();
}

/* RUN TOOL */
async function runTool() {
  if (!files.length) {
    alert("Please upload files first");
    return;
  }

  const formData = new FormData();

  if (tool === "merge-pdf" || tool === "image-to-pdf") {
    files.forEach(f => formData.append("files", f));
  } else {
    formData.append("file", files[0]);
  }

  document.getElementById("progress").style.display = "block";
  document.getElementById("bar").style.width = "40%";

  try {
    const res = await fetch(
      window.location.origin + "/" + tool,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    document.getElementById("bar").style.width = "100%";

    if (data.url) window.open(data.url, "_blank");
    if (data.pages) data.pages.forEach(p => window.open(p, "_blank"));

  } catch {
    alert("Service error. Please try again.");
  }
}
