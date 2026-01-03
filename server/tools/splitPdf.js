const multer = require("multer");
const { PDFDocument } = require("../engine/pdfEngine");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
      const links = [];

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [p] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(p);

        const name = `page_${i + 1}_${Date.now()}.pdf`;
        const out = path.join(OUTPUTS, name);
        fs.writeFileSync(out, await newPdf.save());
        autoDelete(out);
        links.push(`/outputs/${name}`);
      }

      fs.unlinkSync(req.file.path);
      res.json({ pages: links });
    } catch {
      res.status(500).json({ error: "Split failed" });
    }
  }
];
