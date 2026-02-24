const http = require('http');
const https = require('https');
const PDFDocument = require('pdfkit');
const { amountToIndianWords } = require('./numberToIndianWords');

const fetchBufferFromUrl = (url) => new Promise((resolve, reject) => {
  if (!url) return resolve(null);

  const client = url.startsWith('https://') ? https : http;
  client
    .get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`Failed to fetch image: ${response.statusCode}`));
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    })
    .on('error', reject);
});

const buildCertificateFileName = (receiptNumber) => {
  const safe = String(receiptNumber || '').replace(/[^a-zA-Z0-9-_]/g, '');
  return `80G-Certificate-${safe}.pdf`;
};

const generate80GCertificatePdf = async ({
  receiptNumber,
  donationDate,
  donorName,
  donorPan,
  amount,
  ngoName,
  ngoAddress,
  ngoPan,
  eightyGRegistrationNumber,
  authorizedSignatoryName,
  authorizedSignatureImageUrl
}) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  const formattedDate = new Date(donationDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const amountWords = amountToIndianWords(amount);

  doc.fontSize(18).font('Helvetica-Bold').text('80G Donation Certificate', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(11).font('Helvetica').text(`Receipt No: ${receiptNumber}`, { align: 'right' });
  doc.text(`Date: ${formattedDate}`, { align: 'right' });
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Bold').text(ngoName);
  doc.font('Helvetica').fontSize(10).text(ngoAddress);
  doc.moveDown(0.2);
  doc.text(`PAN: ${ngoPan}`);
  doc.text(`80G Registration No: ${eightyGRegistrationNumber}`);

  doc.moveDown(1);
  doc.fontSize(11).text('This is to certify that we have received a donation from:');
  doc.moveDown(0.4);

  doc.font('Helvetica-Bold').text(`Donor Name: `, { continued: true }).font('Helvetica').text(donorName);
  doc.font('Helvetica-Bold').text(`Donor PAN: `, { continued: true }).font('Helvetica').text(donorPan);
  doc.font('Helvetica-Bold').text(`Donation Amount: `, { continued: true }).font('Helvetica').text(`INR ${amount.toFixed(2)}`);
  doc.font('Helvetica-Bold').text(`Amount in Words: `, { continued: true }).font('Helvetica').text(amountWords);

  doc.moveDown(1);
  doc.fontSize(10).text(
    'This receipt is issued towards eligible donation under Section 80G of the Income Tax Act, 1961, subject to applicable laws and rules.',
    { align: 'justify' }
  );

  doc.moveDown(2);
  doc.text('For', { align: 'right' });
  doc.text(ngoName, { align: 'right' });
  doc.moveDown(0.8);

  try {
    const signatureBuffer = await fetchBufferFromUrl(authorizedSignatureImageUrl);
    if (signatureBuffer) {
      const signatureWidth = 120;
      const x = doc.page.width - doc.page.margins.right - signatureWidth;
      doc.image(signatureBuffer, x, doc.y, { width: signatureWidth });
      doc.moveDown(2.6);
    }
  } catch (error) {
    // Signature image is optional in rendering; name below still included.
  }

  doc.text(authorizedSignatoryName || 'Authorized Signatory', { align: 'right' });
  doc.text('Authorized Signatory', { align: 'right' });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(buffers);
      resolve({
        fileName: buildCertificateFileName(receiptNumber),
        buffer
      });
    });
    doc.on('error', reject);
  });
};

module.exports = {
  generate80GCertificatePdf
};
