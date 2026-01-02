// DARK MODE TOGGLE
document.addEventListener("keydown", (e) => {
  if (e.key === "d") {
    document.body.classList.toggle("dark");
  }
});
// ===== GLOBAL ELEMENTS =====
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const progress = document.getElementById("progress");
const bar = document.getElementById("bar");

// ===== DRAG & DROP =====
if (dropZone && fileInput) {
  dropZone.onclick = () => fileInput.click();

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.opacity = "0.7";
  };

  dropZone.ondragleave = () => {
    dropZone.style.opacity = "1";
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    dropZone.style.opacity = "1";
  };
}

// ===== MAIN CONVERT FUNCTION =====
async function convertTool(tool) {
  if (!fileInput || !fileInput.files.length) {
    alert("Please upload file first");
    return;
  }

  const files = fileInput.files;
  const formData = new FormData();

  // Tools that accept multiple files
  if (tool === "image-to-pdf" || tool === "merge-pdf") {
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
  } 
  // Tools that accept single file
  else {
    formData.append("file", files[0]);
  }

  // Show progress bar
  if (progress && bar) {
    progress.style.display = "block";
    bar.style.width = "30%";
  }

  try {
    const response = await fetch(`/${tool}`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (bar) bar.style.width = "100%";

    // Single download
    if (data.url) {
      window.open(data.url, "_blank");
    }

    // Multiple downloads (split PDF)
    if (data.pages && Array.isArray(data.pages)) {
      data.pages.forEach((link) => {
        window.open(link, "_blank");
      });
    }

  } catch (error) {
    alert("Something went wrong. Try again.");
    console.error(error);
  }
}
