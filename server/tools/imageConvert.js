const multer = require("multer");
const sharp = require("sharp");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const format = req.body.format || "png";
      const name = `img_${Date.now()}.${format}`;
      const out = path.join(OUTPUTS, name);

      await sharp(req.file.path)[format]().toFile(out);
      fs.unlinkSync(req.file.path);
      autoDelete(out);

      res.json({ url: `/outputs/${name}` });
    } catch {
      res.status(500).json({ error: "Image convert failed" });
    }
  }
];
