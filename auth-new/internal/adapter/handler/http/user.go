package http

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/zednotdead/dinners/auth/internal/port"
	"github.com/zednotdead/dinners/auth/internal/server/domain/models"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
)

type UserHandler struct {
	svc port.UserService
}

func NewUserHandler(svc port.UserService) *UserHandler {
	return &UserHandler{
		svc: svc,
	}
}

type RegistrationRequest struct {
	Username string
	Email    string
	Password string
}

func (uh *UserHandler) Register(ctx *gin.Context) {
	registration := new(RegistrationRequest)

	if err := ctx.BindJSON(registration); err != nil {
		ctx.Error(err)
		return
	}

	user := models.User{
		Username: registration.Username,
		Email:    registration.Email,
	}

	u, _, err := uh.svc.Register(ctx.Request.Context(), &user, registration.Password)

	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(201, u)
}

type LoginRequest struct {
	Username string
	Password string
}

// ShowAccount godoc
//
//	@Summary		Log in
//	@Description	Log in to the account
//	@Tags			accounts
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.User
//	@Router			/login [get]
func (uh *UserHandler) Login(ctx *gin.Context) {
	tracex := trace.SpanFromContext(ctx)
	b := otel.GetTextMapPropagator().Extract(ctx, propagation.HeaderCarrier(ctx.Request.Header))
	tracet := trace.SpanFromContext(b)
	fmt.Println("AAAAAA", ctx.Request.Header.Get("traceparent"))
	fmt.Println("BBBBBB", tracet.SpanContext().SpanID())
	fmt.Println("CCCCCC", tracex.SpanContext().SpanID())
	login := new(LoginRequest)
	if err := ctx.BindJSON(&login); err != nil {
		ctx.Error(err)
		return
	}

	user := models.User{
		Username: login.Username,
	}

	u, err := uh.svc.LogIn(ctx.Request.Context(), &user, login.Password)
	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(200, u)
}
