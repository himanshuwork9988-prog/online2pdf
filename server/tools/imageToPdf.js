const multer = require("multer");
const { PDFDocument, sharp } = require("../engine/pdfEngine");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.array("files"),
  async (req, res) => {
    try {
      const pdf = await PDFDocument.create();

      for (const file of req.files) {
        const img = await sharp(file.path).png().toBuffer();
        const image = await pdf.embedPng(img);
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0 });
        fs.unlinkSync(file.path);
      }

      const name = `image_${Date.now()}.pdf`;
      const out = path.join(OUTPUTS, name);
      fs.writeFileSync(out, await pdf.save());
      autoDelete(out);

      res.json({ url: `/outputs/${name}` });
    } catch (e) {
      res.status(500).json({ error: "Image to PDF failed" });
    }
  }
];
