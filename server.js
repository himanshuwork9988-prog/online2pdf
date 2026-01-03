const express = require("express");
const cors = require("cors");
const path = require("path");

const pdf = require("./pdf");

const app = express();

// BASIC MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// HEALTH CHECK (IMPORTANT)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ROUTES
app.post("/image-to-pdf", pdf.imageToPDF);
app.post("/merge-pdf", pdf.mergePDF);
app.post("/compress-pdf", pdf.compressPDF);
app.post("/split-pdf", pdf.splitPDF);

// GLOBAL ERROR HANDLER (CRASH PREVENTION)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Service error. Please try again." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
