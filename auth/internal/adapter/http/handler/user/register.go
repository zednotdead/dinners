package user

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/oapi-codegen/runtime/types"
	"github.com/zednotdead/dinners/auth/internal/adapter/http/api"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	"github.com/zednotdead/dinners/auth/internal/port/user"
)

func (uh *UserHandler) Post(ctx *gin.Context) {
	registration := new(api.RegistrationRequest)

	if err := ctx.BindJSON(registration); err != nil {
		handleErrorRegister(ctx, err)
		return
	}

	err := validate.Struct(registration)
	if err != nil {
		handleErrorRegister(ctx, err)
		return
	}

	user := models.User{
		Username: registration.Username,
		Email:    string(registration.Email),
	}

	u, _, err := uh.svc.Register(ctx.Request.Context(), &user, registration.Password)
	if err != nil {
		handleErrorRegister(ctx, err)
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

func handleErrorRegister(ctx *gin.Context, err error) {
	message := err.Error()
	if errors.Is(err, user.UserServiceConflictError) {
		api.Post409JSONResponse{
			Success: false,
			Message: &message,
		}.VisitPostResponse(ctx.Writer)
	} else {
		api.Post500JSONResponse{
			Success: false,
			Message: &message,
		}.VisitPostResponse(ctx.Writer)
	}
}
