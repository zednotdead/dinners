run:
	go run .
dev:
	air 

fmt: fmt-docs fmt-go

fmt-go:
	gofmt -s -w -l .

fmt-docs:
	swag fmt

gen-openapi:
	swag init -g internal/server/NewServer.go
