package server

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	sloggin "github.com/samber/slog-gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/zednotdead/dinners/auth/internal/adapter/http/handler"
	"github.com/zednotdead/dinners/auth/internal/adapter/storage/postgres/repository"
	"github.com/zednotdead/dinners/auth/internal/service"
	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormTrace "gorm.io/plugin/opentelemetry/tracing"

	// Needed for Swagger to work
	_ "github.com/zednotdead/dinners/auth/docs"
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

//	@title			Dinners Auth
//	@version		0.0.1
//	@description	Authentication service for the Dinners app

//	@contact.name	API Support
//	@contact.url	http://deepdi.sh/support
//	@contact.email	me@zed.gay

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

//	@host	localhost:8080

// @externalDocs.description	OpenAPI
// @externalDocs.url			https://swagger.io/resources/open-api/
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
	jwtService := service.NewJwtService("zażółć gęślą jaźń")
	userHandler := handler.NewUserHandler(userService, jwtService)
	app.Use(otelgin.Middleware("dinners/auth"))

	user := app.Group("/")
	user.
		GET("/", userHandler.Info).
		POST("/", userHandler.Register).
		POST("/login", userHandler.Login)

	app.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return &Server{
		App:  app,
		Port: ":8080",
	}
}
