import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file size is reasonable (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      return NextResponse.json(
        { error: 'Pinata API credentials not configured' },
        { status: 500 }
      );
    }

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileSize: file.size.toString(),
        mimeType: file.type
      }
    });
    pinataFormData.append('pinataMetadata', metadata);

    // Upload to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: pinataFormData,
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error('Pinata upload failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to upload to IPFS' },
        { status: 500 }
      );
    }

    const pinataResult = await pinataResponse.json();
    
    return NextResponse.json({
      success: true,
      cid: pinataResult.IpfsHash,
      size: file.size,
      name: file.name,
      gatewayUrl: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${pinataResult.IpfsHash}`
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}