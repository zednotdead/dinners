package repository

import (
	"context"

	"github.com/zednotdead/dinners/auth/internal/domain/models"
)

type CredentialRepository interface {
	CreateCredential(ctx context.Context, credential *models.Credential) (*models.Credential, error)
}
