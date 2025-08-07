package user

import (
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/adapter/http/api"
)

func (uh *UserHandler) Delete(ctx *gin.Context) {
	authHeader := strings.Split(ctx.Request.Header.Get("Authorization"), "Bearer ")
	if len(authHeader) != 2 {
		message := "User is not logged in."
		api.Delete401JSONResponse{
			Success: false,
			Message: &message,
		}.VisitDeleteResponse(ctx.Writer)
		return
	}
	token := authHeader[1]

	blacklisted, err := uh.cache.IsJWTOnBlacklist(ctx, token)
	if err != nil {
		handleErrorDelete(ctx, err)
		return
	}

	if blacklisted {
		handleErrorDelete(ctx, UserHandlerNotLoggedInError)
		return
	}

	claims, err := uh.jwt.DecodeToken(token)
	if err != nil {
		handleErrorDelete(ctx, err)
		return
	}

	id, err := uuid.Parse(claims.Subject)
	if err != nil {
		handleErrorDelete(ctx, err)
		return
	}

	u, err := uh.svc.Info(ctx.Request.Context(), id)
	if err != nil {
		handleErrorDelete(ctx, err)
		return
	}

	err = uh.svc.Logout(ctx.Request.Context(), u, token)
	if err != nil {
		handleErrorDelete(ctx, err)
		return
	}

	api.Delete200JSONResponse{
		Success: true,
	}.VisitDeleteResponse(ctx.Writer)
}

func handleErrorDelete(ctx *gin.Context, err error) {
	message := err.Error()
	if errors.Is(err, UserHandlerNotLoggedInError) {
		api.Delete401JSONResponse{
			Success: true,
			Message: &message,
		}.VisitDeleteResponse(ctx.Writer)
	} else {
		api.Delete500JSONResponse{
			Success: true,
			Message: &message,
		}.VisitDeleteResponse(ctx.Writer)
	}
}
