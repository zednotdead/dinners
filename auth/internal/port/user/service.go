package user

import (
	"context"

	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
)

type UserService interface {
	Register(ctx context.Context, user *models.User, password string) (*models.User, *models.Credential, error)
	LogIn(ctx context.Context, user *models.User, password string) (*models.User, error)
	Info(ctx context.Context, id uuid.UUID) *models.User
}
