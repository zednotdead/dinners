package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	"github.com/zednotdead/dinners/auth/internal/port/user/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo repository.UserRepository
	credRepo repository.CredentialRepository
}

func NewUserService(userRepo repository.UserRepository, credRepo repository.CredentialRepository) *UserService {
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

	hashMatches := false

	for _, v := range user.Credentials {
		err := bcrypt.CompareHashAndPassword([]byte(v.PasswordHash), []byte(password))
		if err != nil {
			continue
		} else {
			hashMatches = true
			break
		}
	}

	if !hashMatches {
		return nil, errors.New("Incorrect password")
	}

	return user, nil
}

func (us *UserService) Info(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user, err := us.userRepo.GetUserByID(ctx, id)

	if err != nil {
		return nil, err
	}

	return user, nil
}
