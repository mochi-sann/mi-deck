.PHONY: generate-misskey-client

generate-misskey-client:
	@echo "Downloading Misskey OpenAPI spec..."
	@curl -s https://misskey.mochi33.com/api.json -o api.json

	@echo "Converting JSON to YAML..."
	@js-yaml ./api.json > ./api.yaml

	@echo "Generating Go client code..."
	@mkdir -p internal/api/misskey
	@oapi-codegen -generate client,types -package misskey ./api.yaml > internal/api/misskey/client.gen.go

	@echo "Cleaning up..."
	@rm api.json api.yaml

	@echo "Misskey client generated successfully!"
