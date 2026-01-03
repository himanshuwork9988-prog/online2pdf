const multer = require("multer");
const { PDFDocument, degrees } = require("pdf-lib");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const degree = parseInt(req.body.degree || "90");
      const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));

      pdf.getPages().forEach(p => {
        p.setRotation(degrees(degree));
      });

      const name = `rotate_${Date.now()}.pdf`;
      const out = path.join(OUTPUTS, name);

      fs.writeFileSync(out, await pdf.save());
      fs.unlinkSync(req.file.path);
      autoDelete(out);

      res.json({ url: `/outputs/${name}`, download: true });
    } catch (e) {
      res.status(500).json({ error: "Rotate failed" });
    }
  }
];
