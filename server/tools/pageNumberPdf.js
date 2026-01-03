const multer = require("multer");
const { PDFDocument, rgb } = require("pdf-lib");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
      const pages = pdf.getPages();

      pages.forEach((p, i) => {
        p.drawText(`Page ${i + 1}`, {
          x: 50,
          y: 20,
          size: 12,
          color: rgb(0, 0, 0)
        });
      });

      const name = `pagenum_${Date.now()}.pdf`;
      const out = path.join(OUTPUTS, name);
      fs.writeFileSync(out, await pdf.save());
      fs.unlinkSync(req.file.path);
      autoDelete(out);

      res.json({ url: `/outputs/${name}` });
    } catch {
      res.status(500).json({ error: "Page numbering failed" });
    }
  }
];
