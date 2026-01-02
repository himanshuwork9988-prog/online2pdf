const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "outputs");

// Create folders if not exist (IMPORTANT FOR RENDER)
if (!require("fs").existsSync(UPLOAD_DIR)) {
  require("fs").mkdirSync(UPLOAD_DIR);
}
if (!require("fs").existsSync(OUTPUT_DIR)) {
  require("fs").mkdirSync(OUTPUT_DIR);
}
const fs = require("fs-extra");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const upload = multer({ dest: UPLOAD_DIR });

exports.imageToPDF = [
  upload.array("files"),
  async (req, res) => {
    const pdf = await PDFDocument.create();

    for (const file of req.files) {
      const imgBuffer = await sharp(file.path).png().toBuffer();
      const img = await pdf.embedPng(imgBuffer);
      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0 });
      fs.remove(file.path);
    }

    const fileName = `img_${Date.now()}.pdf`;
    const out = `outputs/${fileName}`;
    fs.writeFileSync(out, await pdf.save());
    autoDelete(out);

    res.json({ url: `/outputs/${fileName}` });
  }
];

exports.mergePDF = [
  upload.array("files"),
  async (req, res) => {
    const merged = await PDFDocument.create();

    for (const file of req.files) {
      const pdf = await PDFDocument.load(fs.readFileSync(file.path));
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
      fs.remove(file.path);
    }

    const name = `merge_${Date.now()}.pdf`;
    const out = `outputs/${name}`;
    fs.writeFileSync(out, await merged.save());
    autoDelete(out);

    res.json({ url: `/outputs/${name}` });
  }
];

exports.compressPDF = [
  upload.single("file"),
  async (req, res) => {
    const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
    const name = `compress_${Date.now()}.pdf`;
    const out = `outputs/${name}`;
    fs.writeFileSync(out, await pdf.save({ useObjectStreams: false }));
    fs.remove(req.file.path);
    autoDelete(out);
    res.json({ url: `/outputs/${name}` });
  }
];

exports.splitPDF = [
  upload.single("file"),
  async (req, res) => {
    const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
    const links = [];

    for (let i = 0; i < pdf.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [p] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(p);
      const name = `page_${i + 1}_${Date.now()}.pdf`;
      const out = `outputs/${name}`;
      fs.writeFileSync(out, await newPdf.save());
      autoDelete(out);
      links.push(`/outputs/${name}`);
    }

    fs.remove(req.file.path);
    res.json({ pages: links });
  }
];

function autoDelete(path) {
  setTimeout(() => fs.existsSync(path) && fs.remove(path), 5 * 60 * 1000);
}


