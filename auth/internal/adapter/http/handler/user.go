package handler

import (
	"errors"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	"github.com/zednotdead/dinners/auth/internal/service"
)

var validate = validator.New()

type UserHandler struct {
	svc *service.UserService
	jwt *service.JwtService
}

func NewUserHandler(svc *service.UserService, jwtsvc *service.JwtService) *UserHandler {
	return &UserHandler{
		svc: svc,
		jwt: jwtsvc,
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

type LoginResponse struct {
	Token   string `json:"token"`
	Expires string `json:"expires"`
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

	issuedAt := time.Now()
	expiresAt := issuedAt.Add(time.Hour)

	claims := jwt.RegisteredClaims{
		Subject:   u.ID.String(),
		IssuedAt:  jwt.NewNumericDate(issuedAt),
		ExpiresAt: jwt.NewNumericDate(expiresAt),
	}

	token, err := uh.jwt.SignToken(claims)

	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(200, LoginResponse{
		Token:   token,
		Expires: expiresAt.Format(time.RFC1123),
	})
}

// Info godoc
//
//	@Summary		User info
//	@Description	Get information about currently logged in account
//	@Tags			accounts
//	@Produce		json
//	@Success		200	{object}	models.User
//	@Router			/ [get]
func (uh *UserHandler) Info(ctx *gin.Context) {
	authHeader := strings.Split(ctx.Request.Header.Get("Authorization"), "Bearer ")
	if len(authHeader) != 2 {
		ctx.Error(errors.New("Malformed Authorization header"))
		return
	}
	token := authHeader[1]

	claims, err := uh.jwt.DecodeToken(token)
	if err != nil {
		ctx.Error(err)
		return
	}

	id, err := uuid.Parse(claims.Subject)
	if err != nil {
		ctx.Error(err)
		return
	}

	user, err := uh.svc.Info(ctx, id)
	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(200, user)
}
