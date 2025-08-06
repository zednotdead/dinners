package repository

import (
	"context"

	"github.com/zednotdead/dinners/auth/internal/domain/models"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
}
