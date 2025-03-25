.PHONY: run migrate dev build test

run:
	go run cmd/server/main.go

migrate:
	go run cmd/migrate/main.go

dev:
	$(go env GOPATH)/bin/air

build:
	go build -o bin/server cmd/server/main.go

test:
	go test ./...
