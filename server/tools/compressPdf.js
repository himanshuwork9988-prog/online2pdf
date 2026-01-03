const multer = require("multer");
const { PDFDocument } = require("../engine/pdfEngine");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
      const name = `compress_${Date.now()}.pdf`;
      const out = path.join(OUTPUTS, name);
      fs.writeFileSync(out, await pdf.save({ useObjectStreams: false }));
      fs.unlinkSync(req.file.path);
      autoDelete(out);
      res.json({ url: `/outputs/${name}` });
    } catch {
      res.status(500).json({ error: "Compress failed" });
    }
  }
];
