const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");
const UPLOADS = path.join(BASE, "uploads");
const OUTPUTS = path.join(BASE, "outputs");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(UPLOADS);
ensureDir(OUTPUTS);

function autoDelete(filePath, time = 5 * 60 * 1000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }, time);
}

module.exports = {
  fs,
  path,
  UPLOADS,
  OUTPUTS,
  ensureDir,
  autoDelete
};
