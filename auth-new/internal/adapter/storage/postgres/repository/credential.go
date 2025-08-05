package repository

import (
	"context"

	"github.com/jinzhu/copier"
	"github.com/zednotdead/dinners/auth/internal/adapter/storage/postgres/repository/models"
	domain "github.com/zednotdead/dinners/auth/internal/server/domain/models"
	"gorm.io/gorm"
)

type CredentialRepository struct {
	DB *gorm.DB
}

func NewCredentialRepository(db *gorm.DB) *CredentialRepository {
	return &CredentialRepository{
		DB: db,
	}
}

func (repo *CredentialRepository) CreateCredential(ctx context.Context, credential *domain.Credential) (*domain.Credential, error) {
	credModel := models.Credential {
		PasswordHash: credential.PasswordHash,
		UserID: credential.UserID,
	}

	err := gorm.G[models.Credential](repo.DB).Create(ctx, &credModel)

	if err != nil {
		return nil, err
	}

	copier.Copy(&credential, &credModel)

	return credential, nil
}
