# MyTodoProject

## セットアップ

### 1. 環境変数ファイルを作成

```bash
cp .env.example .env
```

作成した .env の値を、自分の環境に合わせて編集してください。

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
npm run dev
```

`npm install`←初回のみ  
`npm run dev`←毎回起動時
