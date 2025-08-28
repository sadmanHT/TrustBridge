import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface DiplomaData {
  holderName: string;
  credentialTitle: string;
  issuerAddress: string;
  txHash: string;
  docHash: string;
  issuedAtISO: string;
  qrPngDataUrl: string;
  logoPngDataUrl?: string;
}

/**
 * Generate a digital diploma PDF using pdf-lib
 * Creates an A4 landscape page with diploma information, QR code, and styling
 */
export async function generateDiplomaPDF(data: DiplomaData): Promise<Uint8Array> {
  const {
    holderName,
    credentialTitle,
    issuerAddress,
    txHash,
    docHash,
    issuedAtISO,
    qrPngDataUrl,
    logoPngDataUrl
  } = data;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add an A4 landscape page (842 x 595 points)
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // Load fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const darkBlue = rgb(0.1, 0.2, 0.4);
  const lightBlue = rgb(0.2, 0.4, 0.7);
  const gold = rgb(0.8, 0.7, 0.2);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  // Draw gradient background (dark-friendly)
  // Create a subtle gradient effect with rectangles
  for (let i = 0; i < height; i += 10) {
    const opacity = 0.05 + (i / height) * 0.1;
    page.drawRectangle({
      x: 0,
      y: i,
      width: width,
      height: 10,
      color: rgb(0.05 + opacity * 0.1, 0.1 + opacity * 0.2, 0.2 + opacity * 0.3),
    });
  }

  // Draw border
  const borderWidth = 3;
  page.drawRectangle({
    x: borderWidth,
    y: borderWidth,
    width: width - (borderWidth * 2),
    height: height - (borderWidth * 2),
    borderColor: gold,
    borderWidth: borderWidth,
  });

  // Inner decorative border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: lightBlue,
    borderWidth: 1,
  });

  // Title "Digital Diploma"
  const titleText = 'Digital Diploma';
  const titleSize = 48;
  page.drawText(titleText, {
    x: width / 2 - (titleFont.widthOfTextAtSize(titleText, titleSize) / 2),
    y: height - 80,
    size: titleSize,
    font: titleFont,
    color: gold,
  });

  // Subtitle line
  page.drawLine({
    start: { x: width / 2 - 150, y: height - 100 },
    end: { x: width / 2 + 150, y: height - 100 },
    thickness: 2,
    color: lightBlue,
  });

  // Certificate text
  const certText = 'This certifies that';
  const certSize = 16;
  page.drawText(certText, {
    x: width / 2 - (bodyFont.widthOfTextAtSize(certText, certSize) / 2),
    y: height - 140,
    size: certSize,
    font: bodyFont,
    color: darkGray,
  });

  // Holder name (big)
  const holderSize = 36;
  page.drawText(holderName, {
    x: width / 2 - (boldFont.widthOfTextAtSize(holderName, holderSize) / 2),
    y: height - 190,
    size: holderSize,
    font: boldFont,
    color: darkBlue,
  });

  // Credential title
  const credentialText = `has successfully completed: ${credentialTitle}`;
  const credentialSize = 20;
  page.drawText(credentialText, {
    x: width / 2 - (bodyFont.widthOfTextAtSize(credentialText, credentialSize) / 2),
    y: height - 240,
    size: credentialSize,
    font: bodyFont,
    color: darkGray,
  });

  // Issued date
  const issuedDate = new Date(issuedAtISO).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateText = `Issued on ${issuedDate}`;
  const dateSize = 14;
  page.drawText(dateText, {
    x: width / 2 - (bodyFont.widthOfTextAtSize(dateText, dateSize) / 2),
    y: height - 280,
    size: dateSize,
    font: bodyFont,
    color: lightGray,
  });

  // Blockchain verification section
  const verificationY = height - 350;
  const leftColumnX = 60;
  const rightColumnX = width - 200;

  // On-chain hash
  const shortHash = `${docHash.slice(0, 10)}...${docHash.slice(-8)}`;
  page.drawText('On-chain hash:', {
    x: leftColumnX,
    y: verificationY,
    size: 12,
    font: boldFont,
    color: darkBlue,
  });
  page.drawText(shortHash, {
    x: leftColumnX,
    y: verificationY - 20,
    size: 10,
    font: bodyFont,
    color: darkGray,
  });

  // Issuer address
  const shortIssuer = `${issuerAddress.slice(0, 8)}...${issuerAddress.slice(-6)}`;
  page.drawText('Issuer:', {
    x: leftColumnX,
    y: verificationY - 50,
    size: 12,
    font: boldFont,
    color: darkBlue,
  });
  page.drawText(shortIssuer, {
    x: leftColumnX,
    y: verificationY - 70,
    size: 10,
    font: bodyFont,
    color: darkGray,
  });

  // Transaction link text
  const shortTx = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
  page.drawText('Transaction:', {
    x: leftColumnX,
    y: verificationY - 100,
    size: 12,
    font: boldFont,
    color: darkBlue,
  });
  page.drawText(shortTx, {
    x: leftColumnX,
    y: verificationY - 120,
    size: 10,
    font: bodyFont,
    color: lightBlue,
  });

  // Embed QR code
  try {
    // Convert data URL to bytes
    const qrImageBytes = Uint8Array.from(
      atob(qrPngDataUrl.split(',')[1]),
      c => c.charCodeAt(0)
    );
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    // Draw QR code
    const qrSize = 120;
    page.drawImage(qrImage, {
      x: rightColumnX,
      y: verificationY - 120,
      width: qrSize,
      height: qrSize,
    });

    // QR code label
    page.drawText('Scan to verify', {
      x: rightColumnX + 20,
      y: verificationY - 140,
      size: 10,
      font: bodyFont,
      color: darkGray,
    });
  } catch (error) {
    console.error('Error embedding QR code:', error);
    // Draw placeholder if QR fails
    page.drawRectangle({
      x: rightColumnX,
      y: verificationY - 120,
      width: 120,
      height: 120,
      borderColor: lightGray,
      borderWidth: 1,
    });
    page.drawText('QR Code', {
      x: rightColumnX + 35,
      y: verificationY - 70,
      size: 12,
      font: bodyFont,
      color: lightGray,
    });
  }

  // Embed logo if provided
  if (logoPngDataUrl) {
    try {
      const logoImageBytes = Uint8Array.from(
        atob(logoPngDataUrl.split(',')[1]),
        c => c.charCodeAt(0)
      );
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      
      // Draw logo in top right
      page.drawImage(logoImage, {
        x: width - 120,
        y: height - 120,
        width: 80,
        height: 80,
      });
    } catch (error) {
      console.error('Error embedding logo:', error);
    }
  }

  // Footer text
  const footerText = 'Verified on TrustBridge Blockchain';
  page.drawText(footerText, {
    x: width / 2 - (bodyFont.widthOfTextAtSize(footerText, 10) / 2),
    y: 40,
    size: 10,
    font: bodyFont,
    color: lightGray,
  });

  // Serialize the PDF document to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Helper function to format address for display
 */
export function formatAddressForDiploma(address: string): string {
  if (!address) return 'N/A';
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

/**
 * Helper function to format hash for display
 */
export function formatHashForDiploma(hash: string): string {
  if (!hash) return 'N/A';
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}