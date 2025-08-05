package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	sloggin "github.com/samber/slog-gin"
	handler "github.com/zednotdead/dinners/auth/internal/adapter/handler/http"
	"github.com/zednotdead/dinners/auth/internal/adapter/storage/postgres/repository"
	"github.com/zednotdead/dinners/auth/internal/server/service"
	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormTrace "gorm.io/plugin/opentelemetry/tracing"
)

// ErrorHandler captures errors and returns a consistent JSON error response
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // Step1: Process the request first.

		// Step2: Check if any errors were added to the context
		if len(c.Errors) > 0 {
			// Step3: Use the last error
			err := c.Errors.Last().Err

			// Step4: Respond with a generic error message
			c.JSON(http.StatusInternalServerError, map[string]any{
				"success": false,
				"message": err.Error(),
			})
		}
	}
}

func NewServer(ctx context.Context) *Server {
	app := gin.New()

	log := slog.New(otelslog.NewHandler("dinners/auth"))
	app.Use(ErrorHandler())
	app.Use(gin.Recovery())

	config := sloggin.Config{
		WithSpanID:        true,
		WithTraceID:       true,
		WithRequestID:     true,
		WithRequestHeader: true,
	}

	app.Use(sloggin.NewWithConfig(log, config))

	db, err := gorm.Open(postgres.Open("host=localhost user=postgres password=postgres dbname=auth port=5432 sslmode=disable TimeZone=Europe/Warsaw"))

	if err != nil {
		panic(err)
	}

	if err := db.Use(gormTrace.NewPlugin()); err != nil {
		panic(err)
	}

	userRepo := repository.NewUserRepository(db)
	credRepo := repository.NewCredentialRepository(db)
	userService := service.NewUserService(userRepo, credRepo)
	userHandler := handler.NewUserHandler(userService)
	app.Use(otelgin.Middleware("dinners/auth"))

	user := app.Group("/")
	user.
		GET("/", func(ctx *gin.Context) {
			ctx.JSON(200, gin.H{
				"username": "",
			})
		}).
		POST("/", userHandler.Register).
		POST("/login", userHandler.Login)

	return &Server{
		App:  app,
		Port: ":8080",
	}
}
