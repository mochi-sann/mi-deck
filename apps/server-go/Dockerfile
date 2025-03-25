FROM golang:1.24-alpine

WORKDIR /app

# Airをインストール
RUN go install github.com/cosmtrek/air@latest

# 依存関係をコピーしてインストール
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 8080

# デフォルトコマンド
CMD ["air", "-c", ".air.toml"]
