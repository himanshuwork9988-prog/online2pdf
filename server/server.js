const express = require("express");
const cors = require("cors");
const path = require("path");

const imageToPdf = require("./tools/imageToPdf");
const mergePdf = require("./tools/mergePdf");
const compressPdf = require("./tools/compressPdf");
const splitPdf = require("./tools/splitPdf");
const pdfToImage = require("./tools/pdfToImage");
const rotatePdf = require("./tools/rotatePdf");
const watermarkPdf = require("./tools/watermarkPdf");
const pageNumberPdf = require("./tools/pageNumberPdf");
const protectPdf = require("./tools/protectPdf");
const unlockPdf = require("./tools/unlockPdf");
const imageConvert = require("./tools/imageConvert");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use(express.static(path.join(__dirname, "../public")));
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Health check
app.get("/health", (_, res) => res.json({ status: "OK" }));

// Routes
app.post("/image-to-pdf", imageToPdf);
app.post("/merge-pdf", mergePdf);
app.post("/compress-pdf", compressPdf);
app.post("/split-pdf", splitPdf);
app.post("/pdf-to-image", pdfToImage);
app.post("/rotate-pdf", rotatePdf);
app.post("/watermark-pdf", watermarkPdf);
app.post("/page-number-pdf", pageNumberPdf);
app.post("/protect-pdf", protectPdf);
app.post("/unlock-pdf", unlockPdf);
app.post("/jpg-png", imageConvert);

// Global error handler (NO CRASH)
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Service error. Please try again." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
