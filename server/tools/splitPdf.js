const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

function parseRange(range, totalPages) {
  if (!range) {
    // all pages
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  // support "1-3"
  if (range.includes("-")) {
    const [start, end] = range.split("-").map(n => parseInt(n, 10) - 1);
    if (isNaN(start) || isNaN(end) || start < 0 || end >= totalPages || start > end) {
      throw new Error("Invalid range");
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // future-safe: "1,3,5"
  if (range.includes(",")) {
    const pages = range.split(",").map(n => parseInt(n, 10) - 1);
    pages.forEach(p => {
      if (isNaN(p) || p < 0 || p >= totalPages) {
        throw new Error("Invalid range");
      }
    });
    return pages;
  }

  throw new Error("Invalid range");
}

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const pdfBytes = fs.readFileSync(req.file.path);
      const pdf = await PDFDocument.load(pdfBytes);
      const total = pdf.getPageCount();

      const range = req.body.range || "";
      const pagesToSplit = parseRange(range.trim(), total);

      const links = [];

      for (let i = 0; i < pagesToSplit.length; i++) {
        const pageIndex = pagesToSplit[i];
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [pageIndex]);
        newPdf.addPage(page);

        const name = `split_${pageIndex + 1}_${Date.now()}.pdf`;
        const out = path.join(OUTPUTS, name);
        fs.writeFileSync(out, await newPdf.save());
        autoDelete(out);
        links.push(`/outputs/${name}`);
      }

      fs.unlinkSync(req.file.path);
      res.json({ pages: links });

    } catch (e) {
      res.status(400).json({ error: "Invalid split range" });
    }
  }
];
