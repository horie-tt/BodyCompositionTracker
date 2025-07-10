import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET() {
  try {
    const result = await apiClient.getAppInfo();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get app info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch app info' },
      { status: 500 }
    );
  }
}
