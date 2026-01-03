const multer = require("multer");
const { PDFDocument } = require("../engine/pdfEngine");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.array("files"),
  async (req, res) => {
    try {
      const merged = await PDFDocument.create();

      for (const file of req.files) {
        const pdf = await PDFDocument.load(fs.readFileSync(file.path));
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => merged.addPage(p));
        fs.unlinkSync(file.path);
      }

      const name = `merge_${Date.now()}.pdf`;
      const out = path.join(OUTPUTS, name);
      fs.writeFileSync(out, await merged.save());
      autoDelete(out);

      res.json({ url: `/outputs/${name}` });
    } catch {
      res.status(500).json({ error: "Merge failed" });
    }
  }
];
