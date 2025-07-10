# Deployment Guide for Vercel

## 前提条件

1. **Vercel Account**: [Vercel](https://vercel.com)にアカウントを作成
2. **GitHub Repository**: プロジェクトをGitHubにプッシュ
3. **Supabase Database**: Supabaseプロジェクトを作成・設定済み

## 1. Vercelプロジェクトの作成

### Web UI経由での作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. "New Project"をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を設定: `body-composition-tracker`
5. Framework Preset: `Next.js`を選択
6. Root Directory: `vercel-migration`を指定（必要に応じて）

### CLI経由での作成

```bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトディレクトリで実行
cd vercel-migration
vercel

# 初回設定
# - Set up and deploy? Y
# - Which scope? (your-username)
# - Link to existing project? N
# - Project name: body-composition-tracker
# - Directory: ./
# - Override settings? N
```

## 2. 環境変数の設定

### 必須環境変数

Vercel Dashboard > Settings > Environment Variables で以下を設定：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Next.js Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### CLI経由での環境変数設定

```bash
# 本番環境
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# プレビュー環境
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# 開発環境
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

## 3. ビルド設定

### vercel.json設定

プロジェクトルートの `vercel.json` で以下を設定：

```json
{
  "version": 2,
  "name": "body-composition-tracker",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "regions": ["nrt1"]
}
```

### package.json scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev --turbopack"
  }
}
```

## 4. デプロイメント

### 自動デプロイ（推奨）

1. GitHubにプッシュすると自動デプロイされる
2. `main` ブランチ → 本番環境
3. その他のブランチ → プレビュー環境

### 手動デプロイ

```bash
# 本番環境にデプロイ
vercel --prod

# プレビュー環境にデプロイ
vercel
```

## 5. ドメイン設定

### カスタムドメイン設定

1. Vercel Dashboard > Settings > Domains
2. カスタムドメインを追加
3. DNS設定を更新

```bash
# CLI経由でのドメイン設定
vercel domains add your-domain.com
vercel domains add www.your-domain.com
```

## 6. パフォーマンス最適化

### 画像最適化

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
  },
}
```

### 静的ファイル最適化

```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

## 7. モニタリング設定

### Vercel Analytics

```bash
# Vercel Analyticsの有効化
vercel analytics
```

### 外部モニタリング

```bash
# 環境変数で設定
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

## 8. セキュリティ設定

### セキュリティヘッダー

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 環境変数の暗号化

```bash
# 機密情報の暗号化
vercel secrets add supabase-url "https://your-project-id.supabase.co"
vercel secrets add supabase-anon-key "your_supabase_anon_key"
```

## 9. CI/CD設定

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitHub Secrets

1. GitHub Repository > Settings > Secrets
2. 以下のシークレットを追加：
   - `VERCEL_TOKEN`: Vercelアクセストークン
   - `VERCEL_ORG_ID`: Vercel組織ID
   - `VERCEL_PROJECT_ID`: VercelプロジェクトID

## 10. トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
npm run build

# ビルドログの確認
vercel logs
```

### 環境変数エラー

```bash
# 環境変数の確認
vercel env ls

# 環境変数の削除
vercel env rm VARIABLE_NAME
```

### デプロイメントエラー

```bash
# デプロイメント履歴
vercel deployments

# 特定のデプロイメントの詳細
vercel logs [deployment-url]
```

## 11. 本番環境チェックリスト

- [ ] Supabase本番データベースの設定
- [ ] 環境変数の設定（本番用）
- [ ] ドメイン設定
- [ ] SSL証明書の確認
- [ ] パフォーマンステスト
- [ ] セキュリティヘッダーの確認
- [ ] モニタリング設定
- [ ] バックアップ設定
- [ ] エラーログ監視
- [ ] 負荷テスト

## 12. 運用監視

### ログ監視

```bash
# リアルタイムログ
vercel logs --follow

# エラーログのみ
vercel logs --level error
```

### パフォーマンス監視

```bash
# Lighthouse CI設定
npm install -g @lhci/cli
lhci autorun
```

### アラート設定

```bash
# Vercel Integrations
# - Slack通知
# - Discord通知
# - PagerDuty連携
```

## 13. スケーリング

### Edge Functions

```javascript
// pages/api/hello.js
export const config = {
  runtime: 'edge',
}

export default function handler(req) {
  return new Response('Hello from Edge!')
}
```

### 地域最適化

```json
{
  "regions": ["nrt1", "hnd1", "sin1"]
}
```

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)