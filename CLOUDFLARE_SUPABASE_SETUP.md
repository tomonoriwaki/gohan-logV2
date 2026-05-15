# もぐログ Cloudflare Pages + Supabase 移行手順

## 1. GitHubにアップロードする

Cloudflare PagesはGitHubの内容を見て公開します。リポジトリ直下に、このファイル群を置いてください。

```text
index.html
styles.css
app.js
supabase-config.js
supabase-schema.sql
terms.html
privacy.html
manifest.webmanifest
service-worker.js
icon.svg
_headers
```

`netlify` フォルダと `netlify.toml` はCloudflare Pagesでは使いません。残っていても静的サイト表示には影響しませんが、混乱する場合は削除してOKです。

## 2. Supabaseプロジェクトを作る

1. Supabaseで新しいプロジェクトを作成
2. `SQL Editor` を開く
3. `supabase-schema.sql` の中身を貼り付けて実行
4. `Authentication` -> `Providers` -> `Email` を有効化
5. `Confirm email` を有効化

このSQLで次を作ります。

- `profiles`: ユーザー情報と管理者権限
- `posts`: 共有投稿
- `post_likes`: いいね
- `post_boosts`: もぐもぐ
- `post-images`: 写真ストレージ
- RLS: 本人投稿削除、管理者削除、本人いいね操作

## 3. SupabaseのURLとanon keyを入れる

Supabaseの `Project Settings` -> `API` から、次を確認します。

- Project URL
- anon public key

`supabase-config.js` を開いて入れます。

```js
window.MOGU_SUPABASE_CONFIG = {
  url: "https://xxxxx.supabase.co",
  anonKey: "eyJ...",
  storageBucket: "post-images",
};
```

anon keyはブラウザに置いてよい公開キーです。Service role keyは絶対に入れないでください。

## 4. 管理者を作る

一度メール登録してログインしたあと、SupabaseのSQL Editorで自分を管理者にします。

```sql
update public.profiles
set role = 'admin'
where email = 'あなたのメールアドレス';
```

管理者は他人の投稿も削除できます。普通のユーザーは自分の投稿だけ削除できます。

## 5. Cloudflare Pagesへ接続

1. Cloudflare Dashboardを開く
2. `Workers & Pages` -> `Create` -> `Pages`
3. GitHubリポジトリ `tomonoriwaki/gohan-log` を選ぶ
4. Build commandは空欄
5. Build output directoryは `/` または空欄
6. Deploy

Cloudflare PagesはGitHub連携で、mainブランチに変更が入るたびに自動公開できます。

## 6. スマホアプリ化

公開URLをスマホで開きます。

- iPhone: Safari -> 共有 -> ホーム画面に追加
- Android: Chrome -> メニュー -> アプリをインストール

`manifest.webmanifest` と `service-worker.js` が入っているため、PWAとしてホーム画面から起動できます。

## 7. ゲストで使える機能

ゲストは次を使えます。

- 投稿の閲覧
- 検索
- 写真プレビュー
- 画像加工
- いいね/もぐもぐのローカル演出
- スマホのホーム画面追加

共有投稿、写真保存、全員に共有されるいいね/もぐもぐはログイン後に使えます。
