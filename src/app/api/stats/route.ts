import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET() {
  try {
    const bodyDataResult = await apiClient.getBodyData();

    if (!bodyDataResult.success || !bodyDataResult.data) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch body data',
      });
    }

    const statsData = apiClient.calculateStats(bodyDataResult.data);

    return NextResponse.json({
      success: true,
      data: statsData,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
