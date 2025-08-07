package user

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
)

type UserService interface {
	Register(ctx context.Context, user *models.User, password string) (*models.User, *models.Credential, error)
	LogIn(ctx context.Context, user *models.User, password string) (*models.User, error)
	Info(ctx context.Context, id uuid.UUID) (*models.User, error)
	Logout(ctx context.Context, user *models.User, token string) error
}

var (
	UserServiceIncorrectPasswordError = errors.New("Incorrect password")
	UserServiceUserNotFoundError      = errors.New("User with the given data was not found.")
	UserServiceConflictError          = errors.New("Attempted to create a user with data for an already existing user")
)
