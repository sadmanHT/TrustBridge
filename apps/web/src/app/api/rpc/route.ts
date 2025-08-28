import { NextResponse } from 'next/server';
import { getEnvConfigSafe } from '@/lib/env';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const env = getEnvConfigSafe();
    const ALCHEMY_KEY = env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    
    if (!ALCHEMY_KEY) {
      return NextResponse.json({ error: "Missing Alchemy API key" }, { status: 500 });
    }

    // Use custom RPC URL if provided, otherwise construct Alchemy URL dynamically
    const networkName = env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia';
    const rpcUrl = env.NEXT_PUBLIC_RPC_URL || `https://eth-${networkName}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    
    const body = await req.text();
    
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("RPC proxy error:", error);
    return NextResponse.json(
      { error: "RPC request failed" },
      { status: 500 }
    );
  }
}