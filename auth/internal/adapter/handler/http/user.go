package http

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	"github.com/zednotdead/dinners/auth/internal/server/service"
)

var validate = validator.New()

type UserHandler struct {
	svc *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{
		svc: svc,
	}
}

type RegistrationRequest struct {
	Username string `json:"username" example:"username" validate:"required,min=5"`
	Email    string `json:"email" example:"username@example.com" validate:"required,email"`
	Password string `json:"password" example:"securepassword" validate:"required,min=5"`
}

// Register godoc
//
//	@Summary		Register
//	@Description	Register a new account
//	@Tags			accounts
//	@Accept			json
//	@Produce		json
//	@Param			registration_request	body		RegistrationRequest	true	"Registration request body"
//	@Success		201						{object}	models.User
//	@Router			/ [post]
func (uh *UserHandler) Register(ctx *gin.Context) {
	registration := new(RegistrationRequest)

	if err := ctx.BindJSON(registration); err != nil {
		ctx.Error(err)
		return
	}

	err := validate.Struct(registration)
	if err != nil {
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
	Username string `json:"username" example:"username" validate:"required,min=5"`
	Password string `json:"password" example:"securepassword" validate:"required,min=5"`
}

// Login godoc
//
//	@Summary		Log in
//	@Description	Log in to the account
//	@Tags			accounts
//	@Accept			json
//	@Produce		json
//	@Param			login_request	body		LoginRequest	true	"Login request object"
//	@Success		200				{object}	models.User
//	@Router			/login [post]
func (uh *UserHandler) Login(ctx *gin.Context) {
	login := new(LoginRequest)
	if err := ctx.BindJSON(&login); err != nil {
		ctx.Error(err)
		return
	}

	err := validate.Struct(login)
	if err != nil {
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
