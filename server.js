const express = require("express");
const cors = require("cors");
const pdf = require("./pdf");

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use("/outputs", express.static("outputs"));

app.post("/image-to-pdf", pdf.imageToPDF);
app.post("/merge-pdf", pdf.mergePDF);
app.post("/compress-pdf", pdf.compressPDF);
app.post("/split-pdf", pdf.splitPDF);

app.listen(3000, () => console.log("Server running on 3000"));
