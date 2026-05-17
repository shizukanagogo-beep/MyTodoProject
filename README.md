# MyTodoProject

## セットアップ

このプロジェクトでは、開発環境では MySQL を Docker で起動し、バックエンドとフロントエンドはローカルで起動する想定です。

### 1. 環境変数ファイルを作成

```bash
cp .env.example .env
```

作成した .env の値を、自分の環境に合わせて編集してください。

本番デプロイ時は以下も環境に合わせて設定してください。

- `VITE_API_BASE_URL`: フロントエンドから見たバックエンド API の URL
- `APP_CORS_ALLOWED_ORIGINS`: バックエンドが許可するフロントエンドの Origin。複数ある場合はカンマ区切り

### 2. mysqlを起動

```bash
docker compose up -d db
```

### 3. バックエンド起動

```bash
cd AllTaskTodo
export $(cat ../.env | xargs)
./gradlew bootRun
```

### 4. フロントエンド起動

```bash
cd alltask-frontend
npm install
export $(cat ../.env | xargs)
npm run dev
```

`npm install`←初回のみ  
`npm run dev`←毎回起動時

## デプロイ前確認

```bash
cd alltask-frontend
export $(cat ../.env | xargs)
npm run build

cd ../AllTaskTodo
./gradlew test
```
