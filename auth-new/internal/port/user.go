package port

import (
	"context"

	"github.com/zednotdead/dinners/auth/internal/server/domain/models"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
}

type CredentialRepository interface {
	CreateCredential(ctx context.Context, credential *models.Credential) (*models.Credential, error)
	// GetCredentialByID(ctx context.Context, id string) (*models.Credential, error)
	// DeleteCredential(ctx context.Context, credential *models.Credential) error
}

type UserService interface {
	Register(ctx context.Context, user *models.User, password string) (*models.User, *models.Credential, error)
	LogIn(ctx context.Context, user *models.User, password string) (*models.User, error)
}
