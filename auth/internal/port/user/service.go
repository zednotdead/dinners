package user

import (
	"context"

	"github.com/zednotdead/dinners/auth/internal/server/domain/models"
)

type UserService interface {
	Register(ctx context.Context, user *models.User, password string) (*models.User, *models.Credential, error)
	LogIn(ctx context.Context, user *models.User, password string) (*models.User, error)
}
