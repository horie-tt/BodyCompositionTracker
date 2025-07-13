/**
 * タイムゾーン関連のユーティリティ関数
 */

/**
 * ユーザーの現在タイムゾーンを取得する
 * フォールバック: Asia/Tokyo (日本向けアプリのため)
 */
export const getUserTimezone = (): string => {
  try {
    // ブラウザ環境でのみ実行
    if (typeof window !== 'undefined') {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        return timezone;
      }
    }
  } catch (error) {
    console.warn('Failed to detect user timezone:', error);
  }
  
  // フォールバック: 日本時間
  return 'Asia/Tokyo';
};

/**
 * 指定されたタイムゾーンで現在の日付を取得 (YYYY-MM-DD形式)
 */
export const getCurrentDateInTimezone = (timezone?: string): string => {
  const tz = timezone || getUserTimezone();
  
  try {
    const now = new Date();
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    return localDate.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Failed to get date in timezone:', tz, error);
    // エラー時はシステム時間を使用
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * 指定されたタイムゾーンで現在の日時文字列を取得
 */
export const getCurrentTimestampInTimezone = (timezone?: string): string => {
  const tz = timezone || getUserTimezone();
  
  try {
    return new Date().toLocaleString('ja-JP', { timeZone: tz });
  } catch (error) {
    console.warn('Failed to get timestamp in timezone:', tz, error);
    // エラー時はISO文字列を使用
    return new Date().toISOString();
  }
};

/**
 * タイムゾーンが有効かどうかを検証
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

/**
 * よく使用されるタイムゾーンのリスト
 */
export const COMMON_TIMEZONES = [
  { value: 'Asia/Tokyo', label: '日本時間 (JST)' },
  { value: 'America/New_York', label: '東部時間 (EST/EDT)' },
  { value: 'America/Los_Angeles', label: '太平洋時間 (PST/PDT)' },
  { value: 'Europe/London', label: 'グリニッジ標準時 (GMT/BST)' },
  { value: 'Europe/Paris', label: '中央ヨーロッパ時間 (CET/CEST)' },
  { value: 'Asia/Shanghai', label: '中国標準時 (CST)' },
  { value: 'Asia/Seoul', label: '韓国標準時 (KST)' },
  { value: 'Australia/Sydney', label: 'オーストラリア東部時間 (AEST/AEDT)' },
] as const;