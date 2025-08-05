package repository

import (
	"context"
	"errors"

	"github.com/jinzhu/copier"
	"github.com/zednotdead/dinners/auth/internal/adapter/storage/postgres/repository/models"
	domain "github.com/zednotdead/dinners/auth/internal/server/domain/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		DB: db,
	}
}

func (repo *UserRepository) CreateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	userModel := models.User{
		Username: user.Username,
		Email:    user.Email,
		Avatar:   user.Avatar,
	}

	err := gorm.G[models.User](repo.DB).Create(ctx, &userModel)

	if err != nil {
		return nil, err
	}

	copier.Copy(&user, &userModel)

	return user, nil
}

func (repo *UserRepository) GetUserByUsername(ctx context.Context, username string) (*domain.User, error) {
	var user models.User

	result := repo.DB.
		WithContext(ctx).
		Preload("Credentials").
		Where("username = ?", username).
		Take(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("User not found")
		}
		return nil, result.Error
	}

	outputUser := domain.User{}
	copier.Copy(&outputUser, &user)

	return &outputUser, nil
}
