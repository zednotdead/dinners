package handler

import (
	"errors"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/oapi-codegen/runtime/types"
	"github.com/zednotdead/dinners/auth/internal/adapter/http/api"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	"github.com/zednotdead/dinners/auth/internal/service"
)

var validate = validator.New()

type UserHandler struct {
	svc        *service.UserService
	jwt        *service.JwtService
	expiration time.Duration
}

func NewUserHandler(svc *service.UserService, jwtsvc *service.JwtService) *UserHandler {
	return &UserHandler{
		svc:        svc,
		jwt:        jwtsvc,
		expiration: 24 * time.Hour,
	}
}

func (uh *UserHandler) Post(ctx *gin.Context) {
	registration := new(api.RegistrationRequest)

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
		Email:    string(registration.Email),
	}

	u, _, err := uh.svc.Register(ctx.Request.Context(), &user, registration.Password)

	if err != nil {
		ctx.Error(err)
		return
	}

	api.Post201JSONResponse{
		Success:  true,
		Id:       u.ID,
		Avatar:   &u.Avatar,
		Email:    types.Email(u.Avatar),
		Username: u.Username,
	}.VisitPostResponse(ctx.Writer)
}

func (uh *UserHandler) PostLogin(ctx *gin.Context) {
	login := new(api.LoginRequest)
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
	expiresAt := issuedAt.Add(uh.expiration)

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

	api.PostLogin200JSONResponse{
		Success: true,
		Token:   token,
		Expires: expiresAt,
	}.VisitPostLoginResponse(ctx.Writer)
}

func (uh *UserHandler) Get(ctx *gin.Context) {
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

	u, err := uh.svc.Info(ctx, id)
	if err != nil {
		ctx.Error(err)
		return
	}

	api.Get200JSONResponse{
		Id:       u.ID,
		Username: u.Username,
		Email:    types.Email(u.Email),
		Avatar:   &u.Avatar,
		Success:  true,
	}.VisitGetResponse(ctx.Writer)
}
