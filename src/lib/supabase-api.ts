import { supabase, BODY_DATA_TABLE } from './supabase';
import { BodyData, StatsData, AppInfo, ApiResponse } from '@/types';

// 日本時間変換ユーティリティ
const convertToJST = (data: any): any => {
  const converted = { ...data };

  // created_at, updated_at を自動変換
  if (converted.created_at) {
    converted.created_at = new Date(converted.created_at).toLocaleString(
      'ja-JP',
      {
        timeZone: 'Asia/Tokyo',
      }
    );
  }

  if (converted.updated_at) {
    converted.updated_at = new Date(converted.updated_at).toLocaleString(
      'ja-JP',
      {
        timeZone: 'Asia/Tokyo',
      }
    );
  }

  return converted;
};

export class SupabaseApiClient {
  // Save body data to Supabase
  async saveBodyData(data: BodyData): Promise<ApiResponse<BodyData>> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
        };
      }

      const { data: result, error } = await supabase
        .from(BODY_DATA_TABLE)
        .insert([
          {
            date: data.date,
            weight: data.weight,
            bmi: data.bmi || null,
            body_fat: data.body_fat || null,
            muscle_mass: data.muscle_mass || null,
            visceral_fat: data.visceral_fat || null,
            calories: data.calories || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return {
          success: false,
          error: error.message || 'Failed to save data',
        };
      }

      // 結果を日本時間に変換
      const convertedResult = convertToJST({
        id: result.id,
        date: result.date,
        weight: result.weight,
        bmi: result.bmi,
        body_fat: result.body_fat,
        muscle_mass: result.muscle_mass,
        visceral_fat: result.visceral_fat,
        calories: result.calories,
        created_at: result.created_at,
      }) as BodyData;

      return {
        success: true,
        data: convertedResult,
      };
    } catch (error) {
      console.error('Supabase save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get all body data from Supabase
  async getBodyData(): Promise<ApiResponse<BodyData[]>> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
        };
      }

      const { data, error } = await supabase
        .from(BODY_DATA_TABLE)
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Supabase select error:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch data',
        };
      }

      // 各データを日本時間に変換
      const bodyData: BodyData[] = data.map((item) =>
        convertToJST({
          id: item.id,
          date: item.date,
          weight: item.weight,
          bmi: item.bmi,
          body_fat: item.body_fat,
          muscle_mass: item.muscle_mass,
          visceral_fat: item.visceral_fat,
          calories: item.calories,
          created_at: item.created_at,
        })
      );

      return {
        success: true,
        data: bodyData,
      };
    } catch (error) {
      console.error('Supabase fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Calculate statistics from data
  calculateStats(data: BodyData[]): StatsData {
    if (data.length === 0) {
      return {
        avgWeight: 0,
        avgBMI: 0,
        totalRecords: 0,
      };
    }

    const validWeights = data.filter((d) => d.weight).map((d) => d.weight);
    const validBMIs = data.filter((d) => d.bmi).map((d) => d.bmi!);

    return {
      avgWeight:
        validWeights.length > 0
          ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length
          : 0,
      avgBMI:
        validBMIs.length > 0
          ? validBMIs.reduce((a, b) => a + b, 0) / validBMIs.length
          : 0,
      totalRecords: data.length,
      latestRecord: data[0], // Assuming data is sorted by date desc
    };
  }

  // Get app info (mock implementation for now)
  async getAppInfo(): Promise<ApiResponse<AppInfo>> {
    return {
      success: true,
      data: {
        version: '2.0.0',
        buildNumber: '1',
        lastUpdated: new Date().toLocaleDateString('ja-JP'),
      },
    };
  }

  // Health check endpoint
  async healthCheck(): Promise<
    ApiResponse<{
      status: string;
      timestamp: string;
    }>
  > {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
        };
      }

      const { error } = await supabase
        .from(BODY_DATA_TABLE)
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
          }),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const supabaseApiClient = new SupabaseApiClient();
