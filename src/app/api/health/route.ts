import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET() {
  try {
    const result = await apiClient.healthCheck();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}
