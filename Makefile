.PHONY: run migrate

run:
	go run cmd/server/main.go

migrate:
	go run cmd/migrate/main.go

dev:
	gin --appPort 8080 --port 3000 --bin ./bin/server --path ./cmd/server run

build:
	go build -o bin/server cmd/server/main.go

test:
	go test ./...
