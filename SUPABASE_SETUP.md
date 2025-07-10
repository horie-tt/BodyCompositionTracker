# Supabase Setup Guide

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

## 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の情報を設定：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 設定値の取得方法

1. Supabaseダッシュボードで作成したプロジェクトを開く
2. 左側メニューの「Settings」→「API」をクリック
3. 「Project URL」をコピーして`NEXT_PUBLIC_SUPABASE_URL`に設定
4. 「anon public」キーをコピーして`NEXT_PUBLIC_SUPABASE_ANON_KEY`に設定

## 3. データベースのセットアップ

### SQL Editor経由でのセットアップ

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase/migrations/001_create_body_data_table.sql`の内容をコピー
3. SQL Editorに貼り付けて実行

### 手動でのテーブル作成

1. Supabaseダッシュボードで「Table Editor」を開く
2. 新しいテーブルを作成：
   - テーブル名: `body_data`
   - カラム:
     - `id` (int8, primary key, identity)
     - `date` (date, not null)
     - `weight` (numeric, not null)
     - `bmi` (numeric, nullable)
     - `body_fat` (numeric, nullable)
     - `muscle_mass` (numeric, nullable)
     - `visceral_fat` (numeric, nullable)
     - `calories` (int4, nullable)
     - `created_at` (timestamptz, default: now())
     - `updated_at` (timestamptz, default: now())

## 4. 接続テスト

開発サーバーを起動後、ブラウザのコンソールで以下を実行：

```javascript
// Supabase接続テスト
import { testSupabaseConnection } from './src/lib/supabase-test'
await testSupabaseConnection()

// データ挿入テスト
import { testSupabaseInsert } from './src/lib/supabase-test'
await testSupabaseInsert()
```

## 5. 使用の切り替え

### MSW (Mock) モードで使用
```bash
# .env.localでSupabaseの設定をコメントアウト
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabaseモードで使用
```bash
# .env.localでSupabaseの設定を有効化
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. トラブルシューティング

### 接続エラー
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトが一時停止されていないか確認
- ネットワーク接続を確認

### データ挿入エラー
- テーブルが作成されているか確認
- 制約違反がないか確認（例：重複する日付）
- Row Level Security (RLS) の設定を確認

### RLS（Row Level Security）の設定

データベースのセキュリティを確保するため、RLSポリシーを設定してください：

```sql
-- Enable RLS on the table
ALTER TABLE body_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (development only)
CREATE POLICY "Public access" ON body_data FOR ALL USING (true);
```

**注意**: 本番環境では適切な認証とアクセス制御を実装してください。

## 7. 開発からプロダクションへの移行

### Vercelでの環境変数設定

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」
3. 以下の変数を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### データベースの本番環境用最適化

1. インデックスの最適化
2. バックアップの設定
3. 監視の設定
4. 適切なRLSポリシーの実装