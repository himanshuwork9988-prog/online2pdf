const multer = require("multer");
const { exec } = require("child_process");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const input = req.file.path;
      const name = `compress_${Date.now()}.pdf`;
      const output = path.join(OUTPUTS, name);

      const cmd = `
        gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
        -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
        -sOutputFile="${output}" "${input}"
      `;

      exec(cmd, err => {
        fs.unlinkSync(input);

        if (err) {
          return res.status(500).json({ error: "Compression failed" });
        }

        autoDelete(output);
        res.json({ url: `/outputs/${name}` });
      });

    } catch {
      res.status(500).json({ error: "Compress failed" });
    }
  }
];
