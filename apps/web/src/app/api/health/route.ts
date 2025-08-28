import { NextResponse } from 'next/server';
import { checkEnvironment, getEnvConfigSafe } from '@/lib/env';
import { prisma } from '@/lib/prisma';

/**
 * Check the status of external services
 */
async function getServiceStatus() {
  const services: Record<string, string> = {};
  
  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = 'healthy';
  } catch (error) {
    services.database = 'unhealthy';
    console.error('Database health check failed:', error);
  }
  
  // Check blockchain RPC connection
  try {
    const env = getEnvConfigSafe();
    const networkName = env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia';
    const rpcUrl = env.NEXT_PUBLIC_RPC_URL || `https://eth-${networkName}.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      services.blockchain = data.result ? 'healthy' : 'unhealthy';
    } else {
      services.blockchain = 'unhealthy';
    }
  } catch (error) {
    services.blockchain = 'unhealthy';
    console.error('Blockchain health check failed:', error);
  }
  
  return services;
}

/**
 * Health check endpoint that includes environment validation
 * GET /api/health
 */
export async function GET() {
  try {
    const envCheck = checkEnvironment();
    
    const health = {
      status: envCheck.isValid ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      validation: {
        isValid: envCheck.isValid,
        errorCount: envCheck.errors.length,
        warningCount: envCheck.warnings.length,
        // Only include error details in development
        ...(process.env.NODE_ENV === 'development' && {
          errors: envCheck.errors,
          warnings: envCheck.warnings,
        }),
      },
      services: await getServiceStatus(),
    };
    
    const statusCode = envCheck.isValid ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}