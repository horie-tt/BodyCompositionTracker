import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET() {
  try {
    const result = await apiClient.getBodyData();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get body data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch body data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await apiClient.saveBodyData(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Save body data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save body data' },
      { status: 500 }
    );
  }
}
