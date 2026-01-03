const multer = require("multer");
const { exec } = require("child_process");
const { fs, path, UPLOADS, OUTPUTS, autoDelete } = require("../engine/fileManager");

const upload = multer({ dest: UPLOADS });

module.exports = [
  upload.single("file"),
  async (req, res) => {
    try {
      const password = req.body.password;
      if (!password) {
        return res.status(400).json({ error: "Password required" });
      }

      const input = req.file.path;
      const name = `protect_${Date.now()}.pdf`;
      const output = path.join(OUTPUTS, name);

      const cmd = `qpdf --encrypt ${password} ${password} 256 -- "${input}" "${output}"`;

      exec(cmd, err => {
        fs.unlinkSync(input);

        if (err) {
          return res.status(500).json({ error: "Password protection failed" });
        }

        autoDelete(output);
        res.json({ url: `/outputs/${name}` });
      });

    } catch {
      res.status(500).json({ error: "Protect failed" });
    }
  }
];
