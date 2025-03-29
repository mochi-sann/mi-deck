.PHONY: generate-misskey-client

generate-misskey-client:
	@echo "Downloading Misskey OpenAPI spec..."
	@curl -s https://misskey.mochi33.com/api.json -o api.json

	@echo "Generating Go client code..."
	@mkdir -p internal/api/misskey
	@oapi-codegen -generate client,types -package misskey api.json > internal/api/misskey/client.gen.go

	@echo "Cleaning up..."
	@rm api.json

	@echo "Misskey client generated successfully!"
