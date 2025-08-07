package user

import (
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/oapi-codegen/runtime/types"
	"github.com/zednotdead/dinners/auth/internal/adapter/http/api"
)

func (uh *UserHandler) Get(ctx *gin.Context) {
	authHeader := strings.Split(ctx.Request.Header.Get("Authorization"), "Bearer ")
	if len(authHeader) != 2 {
		handleErrorInfo(ctx, UserHandlerNotLoggedInError)
		return
	}
	token := authHeader[1]

	blacklisted, err := uh.cache.IsJWTOnBlacklist(ctx, token)
	if err != nil {
		handleErrorInfo(ctx, err)
		return
	}

	if blacklisted {
		handleErrorInfo(ctx, UserHandlerNotLoggedInError)
		return
	}

	claims, err := uh.jwt.DecodeToken(token)
	if err != nil {
		handleErrorInfo(ctx, err)
		return
	}

	id, err := uuid.Parse(claims.Subject)
	if err != nil {
		handleErrorInfo(ctx, err)
		return
	}

	u, err := uh.svc.Info(ctx, id)
	if err != nil {
		handleErrorInfo(ctx, err)
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

func handleErrorInfo(ctx *gin.Context, err error) {
	message := err.Error()
	if errors.Is(err, UserHandlerNotLoggedInError) {
		api.Get401JSONResponse{
			Success: false,
			Message: &message,
		}.VisitGetResponse(ctx.Writer)
	} else {
		api.Get500JSONResponse{
			Success: false,
			Message: &message,
		}.VisitGetResponse(ctx.Writer)
	}
}
