package user

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/zednotdead/dinners/auth/internal/adapter/http/api"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	userPort "github.com/zednotdead/dinners/auth/internal/port/user"
)

func (uh *UserHandler) PostLogin(ctx *gin.Context) {
	login := new(api.LoginRequest)
	if err := ctx.BindJSON(&login); err != nil {
		handleErrorLogin(ctx, err)
		return
	}

	err := validate.Struct(login)
	if err != nil {
		handleErrorLogin(ctx, err)
		return
	}

	user := models.User{
		Username: login.Username,
	}

	u, err := uh.svc.LogIn(ctx.Request.Context(), &user, login.Password)
	if err != nil {
		handleErrorLogin(ctx, err)
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
		handleErrorLogin(ctx, err)
		return
	}

	api.PostLogin200JSONResponse{
		Success: true,
		Token:   token,
		Expires: expiresAt,
	}.VisitPostLoginResponse(ctx.Writer)
}

func handleErrorLogin(ctx *gin.Context, err error) {
	message := err.Error()
	if errors.Is(err, userPort.UserServiceUserNotFoundError) {
		api.PostLogin404JSONResponse{
			Success: true,
			Message: &message,
		}.VisitPostLoginResponse(ctx.Writer)
	} else if errors.Is(err, userPort.UserServiceIncorrectPasswordError) {
		api.PostLogin403JSONResponse{
			Success: true,
			Message: &message,
		}.VisitPostLoginResponse(ctx.Writer)
	} else {
		api.PostLogin500JSONResponse{
			Success: true,
			Message: &message,
		}.VisitPostLoginResponse(ctx.Writer)
	}
}
