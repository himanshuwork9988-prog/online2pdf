/* =========================
   TOOL DETECTION
========================= */
const params = new URLSearchParams(window.location.search);
const tool = params.get("tool");

/* =========================
   TITLES
========================= */
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

/* =========================
   ELEMENTS
========================= */
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const progress = document.getElementById("progress");
const bar = document.getElementById("bar");

/* OPTIONS */
const rotateOptions = document.getElementById("rotateOptions");
const splitOptions = document.getElementById("splitOptions");
const passwordBox = document.getElementById("passwordBox");
const imgFormatBox = document.getElementById("imgFormatBox");

/* =========================
   SHOW OPTIONS BASED ON TOOL
========================= */
if (tool === "rotate-pdf") rotateOptions && (rotateOptions.style.display = "block");
if (tool === "split-pdf") splitOptions && (splitOptions.style.display = "block");
if (tool === "protect-pdf" || tool === "unlock-pdf")
  passwordBox && (passwordBox.style.display = "block");
if (tool === "jpg-png") imgFormatBox && (imgFormatBox.style.display = "block");

/* =========================
   FILE HANDLING
========================= */
let files = [];

dropZone.onclick = () => fileInput.click();

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

fileInput.onchange = () => addFiles([...fileInput.files]);

function addFiles(newFiles) {
  newFiles.forEach(f => files.push(f));
  renderFiles();
}

function renderFiles() {
  fileList.innerHTML = "";
  files.forEach((file, index) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.draggable = true;
    li.innerHTML = `<span>${file.name}</span><span>☰</span>`;

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

/* =========================
   RUN TOOL
========================= */
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

  /* TOOL OPTIONS */
  if (tool === "rotate-pdf") {
    formData.append(
      "degree",
      document.getElementById("rotateDegree").value
    );
  }

  if (tool === "split-pdf") {
    formData.append(
      "range",
      document.getElementById("splitRange").value
    );
  }

  if (tool === "protect-pdf") {
    formData.append(
      "password",
      document.getElementById("pdfPassword").value
    );
  }

  if (tool === "unlock-pdf") {
    formData.append(
      "password",
      document.getElementById("pdfPassword").value
    );
  }

  if (tool === "jpg-png") {
    formData.append(
      "format",
      document.getElementById("imgFormat").value
    );
  }

  progress.style.display = "block";
  bar.style.width = "40%";

  try {
    const res = await fetch(
      window.location.origin + "/" + tool,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    bar.style.width = "100%";

    if (data.url) forceDownload(data.url);
    if (data.pages) data.pages.forEach(p => forceDownload(p));

  } catch (e) {
    alert("Service error. Please try again.");
  } finally {
    setTimeout(() => {
      progress.style.display = "none";
      bar.style.width = "0%";
    }, 1500);
  }
}

/* =========================
   FORCE DOWNLOAD
========================= */
function forceDownload(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
