.ONESHELL:
.SHELLFLAGS += -e

run:
	go run .
dev:
	air 

fmt: fmt-client fmt-server

fmt-client:
	@echo "--- START: FORMATTING CLIENT ---"
	cd client
	bun run lint:fix
	@echo "--- END: FORMATTING CLIENT ---"

fmt-server:
	@echo "--- START: FORMATTING SERVER ---"
	gofmt -s -w -l .
	@echo "--- END: FORMATTING SERVER ---"

openapi: openapi-client openapi-server

openapi-server:
	@echo "--- START: GENERATING SERVER ENTRIES BASED ON OPENAPI DEFINITION ---"
	@go generate internal/adapter/http/api/generate.go
	@echo "--- END: GENERATING SERVER ENTRIES BASED ON OPENAPI DEFINITION ---"

openapi-client:
	@cd client
	@echo "--- START: GENERATING CLIENT BASED ON OPENAPI DEFINITION ---"
	bun run gen:openapi
	@echo "--- END: GENERATING CLIENT BASED ON OPENAPI DEFINITION ---"
