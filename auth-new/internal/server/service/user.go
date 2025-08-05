package service

import (
	"context"
	"fmt"

	"github.com/zednotdead/dinners/auth/internal/port"
	"github.com/zednotdead/dinners/auth/internal/server/domain/models"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo port.UserRepository
	credRepo port.CredentialRepository
}

func NewUserService(userRepo port.UserRepository, credRepo port.CredentialRepository) *UserService {
	return &UserService{
		userRepo,
		credRepo,
	}
}

func (us *UserService) Register(ctx context.Context, user *models.User, password string) (*models.User, *models.Credential, error) {
	user, err := us.userRepo.CreateUser(ctx, user)
	if err != nil {
		return nil, nil, err
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return nil, nil, err
	}

	fmt.Println(user.ID)

	credential, err := us.credRepo.CreateCredential(ctx, &models.Credential{
		UserID:       user.ID,
		PasswordHash: string(passwordHash),
	})

	return user, credential, nil
}

func (us *UserService) LogIn(ctx context.Context, user *models.User, password string) (*models.User, error) {
	user, err := us.userRepo.GetUserByUsername(ctx, user.Username)
	if err != nil {
		return nil, err
	}

	return user, nil
}
