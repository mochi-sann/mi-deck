.PHONY: run migrate

run:
	go run cmd/server/main.go

migrate:
	go run cmd/migrate/main.go

dev:
	air

build:
	go build -o bin/server cmd/server/main.go

test:
	go test ./...
root = "."
tmp_dir = "tmp"

[build]
  cmd = "go build -o ./bin/server ./cmd/server/main.go"
  bin = "./bin/server"
  full_bin = "./bin/server"
  exclude_dir = ["bin", "tmp", "vendor"]
  exclude_file = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  kill_delay = "1s"
  delay = 1000
  stop_on_error = true
  send_interrupt = false

[log]
  time = false

[color]
  main = "magenta"
  watcher = "cyan"
  build = "yellow"
  runner = "green"

[misc]
  clean_on_exit = true
