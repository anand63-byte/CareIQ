const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileData: { type: Buffer, required: true }, // Store the PDF file as binary data
  uploadedAt: { type: Date, default: Date.now },
  text: { type: String, required: true }, // Store extracted text from the PDF
});

module.exports = mongoose.model('Pdf', pdfSchema);
