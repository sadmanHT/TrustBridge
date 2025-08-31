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

  // Colors - Enhanced for better visibility
  const darkBlue = rgb(0.1, 0.2, 0.4);
  const lightBlue = rgb(0.2, 0.4, 0.7);
  const gold = rgb(1.0, 0.84, 0.0); // Brighter gold (#FFD700)
  const white = rgb(1.0, 1.0, 1.0); // Pure white for text
  const lightGray = rgb(0.9, 0.9, 0.9); // Much lighter gray
  const shadowColor = rgb(0.0, 0.0, 0.0); // Black shadow
  const overlayColor = rgb(0.0, 0.0, 0.0, 0.3); // Semi-transparent overlay

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

  // Title "Verification Certificate by TrustBridge" with background overlay
  const titleText = 'Verification Certificate by TrustBridge';
  const titleSize = 44;
  const titleWidth = titleFont.widthOfTextAtSize(titleText, titleSize);
  const titleX = width / 2 - (titleWidth / 2);
  
  // Background overlay for title
  page.drawRectangle({
    x: titleX - 20,
    y: height - 95,
    width: titleWidth + 40,
    height: 50,
    color: rgb(0.0, 0.0, 0.0, 0.4),
  });
  
  // Strong shadow effect for title
  page.drawText(titleText, {
    x: titleX + 3,
    y: height - 83,
    size: titleSize,
    font: titleFont,
    color: shadowColor,
  });
  // Main title text in bright gold
  page.drawText(titleText, {
    x: titleX,
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

  // Certificate text with better visibility
  const certText = 'This certifies that';
  const certSize = 18;
  const certX = width / 2 - (bodyFont.widthOfTextAtSize(certText, certSize) / 2);
  
  // Shadow for certificate text
  page.drawText(certText, {
    x: certX + 1,
    y: height - 141,
    size: certSize,
    font: bodyFont,
    color: shadowColor,
  });
  // Main certificate text in white
  page.drawText(certText, {
    x: certX,
    y: height - 140,
    size: certSize,
    font: bodyFont,
    color: white,
  });

  // Holder name (big and prominent) with background
  const holderSize = 44;
  const holderWidth = boldFont.widthOfTextAtSize(holderName, holderSize);
  const holderX = width / 2 - (holderWidth / 2);
  
  // Background overlay for holder name
  page.drawRectangle({
    x: holderX - 15,
    y: height - 205,
    width: holderWidth + 30,
    height: 40,
    color: rgb(0.0, 0.0, 0.0, 0.4),
  });
  
  // Strong shadow for holder name
  page.drawText(holderName, {
    x: holderX + 2,
    y: height - 192,
    size: holderSize,
    font: boldFont,
    color: shadowColor,
  });
  // Main holder name in bright white
  page.drawText(holderName, {
    x: holderX,
    y: height - 190,
    size: holderSize,
    font: boldFont,
    color: white,
  });

  // Credential title with enhanced visibility
  const credentialText = `has successfully completed: ${credentialTitle}`;
  const credentialSize = 24;
  const credentialX = width / 2 - (bodyFont.widthOfTextAtSize(credentialText, credentialSize) / 2);
  
  // Shadow for credential text
  page.drawText(credentialText, {
    x: credentialX + 1,
    y: height - 241,
    size: credentialSize,
    font: bodyFont,
    color: shadowColor,
  });
  // Main credential text in light gray
  page.drawText(credentialText, {
    x: credentialX,
    y: height - 240,
    size: credentialSize,
    font: bodyFont,
    color: lightGray,
  });

  // Issued date with better visibility
  const issuedDate = new Date(issuedAtISO).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateText = `Issued on ${issuedDate}`;
  const dateSize = 16;
  const dateX = width / 2 - (bodyFont.widthOfTextAtSize(dateText, dateSize) / 2);
  
  // Shadow for date text
  page.drawText(dateText, {
    x: dateX + 1,
    y: height - 281,
    size: dateSize,
    font: bodyFont,
    color: shadowColor,
  });
  // Main date text in white
  page.drawText(dateText, {
    x: dateX,
    y: height - 280,
    size: dateSize,
    font: bodyFont,
    color: white,
  });

  // Blockchain verification section
  const verificationY = height - 350;
  const leftColumnX = 60;
  const rightColumnX = width - 200;

  // On-chain hash with better visibility - show full hash
  const fullHash = docHash;
  // Shadow for hash label
  page.drawText('On-chain hash:', {
    x: leftColumnX + 1,
    y: verificationY - 1,
    size: 14,
    font: boldFont,
    color: shadowColor,
  });
  page.drawText('On-chain hash:', {
    x: leftColumnX,
    y: verificationY,
    size: 14,
    font: boldFont,
    color: white,
  });
  // Shadow for hash value
  page.drawText(fullHash, {
    x: leftColumnX + 1,
    y: verificationY - 21,
    size: 10,
    font: bodyFont,
    color: shadowColor,
  });
  page.drawText(fullHash, {
    x: leftColumnX,
    y: verificationY - 20,
    size: 10,
    font: bodyFont,
    color: lightGray,
  });

  // Issuer address with better visibility - show full issuer
  const fullIssuer = issuerAddress;
  // Shadow for issuer label
  page.drawText('Issuer:', {
    x: leftColumnX + 1,
    y: verificationY - 51,
    size: 14,
    font: boldFont,
    color: shadowColor,
  });
  page.drawText('Issuer:', {
    x: leftColumnX,
    y: verificationY - 50,
    size: 14,
    font: boldFont,
    color: white,
  });
  // Shadow for issuer value
  page.drawText(fullIssuer, {
    x: leftColumnX + 1,
    y: verificationY - 71,
    size: 10,
    font: bodyFont,
    color: shadowColor,
  });
  page.drawText(fullIssuer, {
    x: leftColumnX,
    y: verificationY - 70,
    size: 10,
    font: bodyFont,
    color: lightGray,
  });

  // Transaction link text with better visibility
  const shortTx = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
  // Shadow for transaction label
  page.drawText('Transaction:', {
    x: leftColumnX + 1,
    y: verificationY - 101,
    size: 14,
    font: boldFont,
    color: shadowColor,
  });
  page.drawText('Transaction:', {
    x: leftColumnX,
    y: verificationY - 100,
    size: 14,
    font: boldFont,
    color: white,
  });
  // Shadow for transaction value
  page.drawText(shortTx, {
    x: leftColumnX + 1,
    y: verificationY - 121,
    size: 12,
    font: bodyFont,
    color: shadowColor,
  });
  page.drawText(shortTx, {
    x: leftColumnX,
    y: verificationY - 120,
    size: 12,
    font: bodyFont,
    color: lightGray,
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

  // Footer text with better visibility
  const footerText = 'Verified on TrustBridge Blockchain';
  // Shadow for footer text
  page.drawText(footerText, {
    x: width / 2 - (boldFont.widthOfTextAtSize(footerText, 14) / 2) + 1,
    y: 39,
    size: 14,
    font: boldFont,
    color: shadowColor,
  });
  page.drawText(footerText, {
    x: width / 2 - (boldFont.widthOfTextAtSize(footerText, 14) / 2),
    y: 40,
    size: 14,
    font: boldFont,
    color: white,
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