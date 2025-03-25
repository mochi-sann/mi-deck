FROM golang:1.24

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client
# Airをインストール
RUN go install github.com/air-verse/air@latest
# swagをインストール
RUN go install github.com/swaggo/swag/cmd/swag@latest

# 依存関係をコピーしてインストール
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 8080

# デフォルトコマンド
CMD ["air", "-c", ".air.toml"]
