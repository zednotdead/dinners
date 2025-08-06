package server

import (
	"context"

	"github.com/zednotdead/dinners/auth/internal/server"
)

func Server() {
	ctx := context.Background()
	app := server.NewServer(ctx)
	app.StartServer()
}
