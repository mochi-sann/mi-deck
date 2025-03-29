.PHONY: generate-misskey-client

generate-misskey-client:
	@echo "Downloading Misskey OpenAPI spec..."
	@curl -s https://misskey.mochi33.com/api.json -o api.json

	@echo "Converting JSON to YAML..."
	@python3 -c "import json, yaml; print(yaml.dump(json.load(open('api.json')), allow_unicode=True, sort_keys=False))" > api.yaml

	@echo "Generating Go client code..."
	@mkdir -p internal/api/misskey
	@oapi-codegen -generate client,types -package misskey api.yaml > internal/api/misskey/client.gen.go

	@echo "Cleaning up..."
	@rm api.json api.yaml

	@echo "Misskey client generated successfully!"
