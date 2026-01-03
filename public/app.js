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

document.getElementById("toolTitle").innerText = titles[tool] || "PDF Tool";

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.onclick = () => fileInput.click();

function runTool() {
  alert("Backend will process: " + tool);
}
