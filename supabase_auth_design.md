# Supabase Auth Design

## 認証フロー
1. `/login` でメール/パスワード入力
2. `POST /api/auth/login` へ送信
3. Supabase `signInWithPassword` 実行
4. セッション確立（HTTP Only Cookie）
5. 認証後ページへ遷移

## ログアウト
1. `POST /api/auth/logout`
2. Supabase `signOut`
3. ログインページへ遷移

## 実装要点
- サーバー側は `@supabase/ssr` を利用
- 未認証ユーザーはミドルウェアで遮断
- 権限制御は JWT + RLS で実施

## セキュリティ要件
- `SUPABASE_SERVICE_ROLE_KEY` はサーバーのみ
- `Leaked password protection` を有効化
- 監査ログ（ログイン失敗・管理者操作）を記録
