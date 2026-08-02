# 口コミ生成アンケートシステム(フロントエンド)

Arbre et chimie Group 向けの口コミ生成アンケートシステムのフロントエンド(React + Vite)。
バックエンド(GAS Web App + Google Sheets)と組み合わせて動作します。

## 画面構成

- `/` … 管理画面(店舗の切替・追加・削除、アンケート項目編集、AI生成設定)
- `/survey/:storeId` … お客様アンケート画面(店舗ごとに固有のURL。QRコード配布用)

## セットアップ

前提として、以下がステップ1・ステップ2で完了していること:
- Google Sheetsのデータベース(店舗マスタ / アンケート設定 / 回答ログ / 回答明細)
- GASのWeb App(`api.gs`)がデプロイ済みで `/exec` URLを取得済み

### 1. 依存関係のインストール

```
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーし、GASの `/exec` URLを設定する。

```
cp .env.example .env
```

```
VITE_API_BASE_URL=https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec
```

### 3. ローカル確認

```
npm run dev
```

## Vercelへのデプロイ

既存の顧客カルテシステムなどと同じ手順です。

1. このフォルダをGitHubリポジトリにpushする
2. Vercelで「Add New Project」→ 対象のGitHubリポジトリを選択
3. Vercelの「Environment Variables」に `VITE_API_BASE_URL` を設定(手元の`.env`と同じ値)
4. デプロイ

デプロイ後、`https://xxxxx.vercel.app/survey/store_arbre` のような形で店舗ごとのアンケートURLが使えるようになります(`store_arbre` などのIDは管理画面の店舗切替プルダウンの値、またはGoogle Sheetsの「店舗マスタ」シートの store_id 列で確認できます)。

QRコードにする際は、この `/survey/:storeId` のURLをそのまま使ってください。

## 既知の注意点

- GAS側は「アクセス:全員」で公開する必要があります(店舗のお客様がログインなしでアクセスするため)。
- 現状は簡易的な認証なしのAPIです。本番でアクセスが増えてきたら、リクエストに簡易トークンを付与するなどの対策を検討してください。
