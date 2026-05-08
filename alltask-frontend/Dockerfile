# nodeのバージョンは20を使用
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Viteの開発サーバーを起動。--hostがないとコンテナ外からアクセスできません
CMD ["npm", "run", "dev", "--", "--host"]