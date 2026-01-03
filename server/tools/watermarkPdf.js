const multer = require("multer");
const { PDFDocument, rgb } = require("pdf-lib");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
      const text = req.body.text || "PDF Tools";

      pdf.getPages().forEach(p => {
        p.drawText(text, {
          x: 50,
          y: 50,
          size: 20,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.5
        });
      });

      const name = `watermark_${Date.now()}.pdf`;
      const out = path.join(OUTPUTS, name);
      fs.writeFileSync(out, await pdf.save());
      fs.unlinkSync(req.file.path);
      autoDelete(out);

      res.json({ url: `/outputs/${name}` });
    } catch {
      res.status(500).json({ error: "Watermark failed" });
    }
  }
];
