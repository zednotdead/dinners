package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*models.User, error)
}

var (
	UserRepositoryGetUserNotFoundError = errors.New("Could not find user")
)
