package server

import (
	"context"

	"github.com/zednotdead/dinners/auth/internal/adapter/http/server"
)

func Server() {
	ctx := context.Background()
	app := server.NewServer(ctx)
	app.StartServer()
}
