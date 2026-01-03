const params = new URLSearchParams(window.location.search);
const tool = params.get("tool");

const titles = {
  "image-to-pdf": "Image to PDF",
  "pdf-to-image": "PDF to Image",
  "merge-pdf": "Merge PDF",
  "split-pdf": "Split PDF",
  "compress-pdf": "Compress PDF",
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
const progress = document.getElementById("progress");
const bar = document.getElementById("bar");

dropZone.onclick = () => fileInput.click();

dropZone.ondragover = e => e.preventDefault();
dropZone.ondrop = e => {
  e.preventDefault();
  fileInput.files = e.dataTransfer.files;
};

async function runTool() {
  if (!fileInput.files.length) {
    alert("Please upload a file first");
    return;
  }

  const formData = new FormData();
  const files = fileInput.files;

  if (tool === "image-to-pdf" || tool === "merge-pdf") {
    for (let f of files) formData.append("files", f);
  } else {
    formData.append("file", files[0]);
  }

  progress.style.display = "block";
  bar.style.width = "30%";

  try {
    const res = await fetch(
      window.location.origin + "/" + tool,
      {
        method: "POST",
        body: formData
      }
    );

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    bar.style.width = "100%";

    if (data.url) {
      window.open(data.url, "_blank");
    } else if (data.pages) {
      data.pages.forEach(p => window.open(p, "_blank"));
    } else {
      alert("Unexpected server response");
    }

  } catch (err) {
    console.error(err);
    alert("Service error. Please try again.");
  } finally {
    setTimeout(() => {
      progress.style.display = "none";
      bar.style.width = "0%";
    }, 1500);
  }
}
