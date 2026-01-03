const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const progress = document.getElementById("progress");
const bar = document.getElementById("bar");

// Drag & drop
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

// 🔥 MAIN FIX: ABSOLUTE API CALL
async function convertTool(tool) {
  if (!fileInput || !fileInput.files.length) {
    alert("Please upload file");
    return;
  }

  const formData = new FormData();
  const files = fileInput.files;

  if (tool === "image-to-pdf" || tool === "merge-pdf") {
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
  } else {
    formData.append("file", files[0]);
  }

  progress.style.display = "block";
  bar.style.width = "30%";

  try {
    const response = await fetch(
      window.location.origin + "/" + tool,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    bar.style.width = "100%";

    if (data.url) {
      window.open(data.url, "_blank");
    }

    if (data.pages) {
      data.pages.forEach(link => window.open(link, "_blank"));
    }

  } catch (err) {
    alert("Server error. Please try again.");
    console.error(err);
  }
}
