package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/zednotdead/dinners/auth/internal/domain/models"
	"github.com/zednotdead/dinners/auth/internal/port/cache"
	userPort "github.com/zednotdead/dinners/auth/internal/port/user"
	"github.com/zednotdead/dinners/auth/internal/port/user/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	userRepo repository.UserRepository
	credRepo repository.CredentialRepository
	cache    cache.CacheService
}

func NewUserService(
	userRepo repository.UserRepository,
	credRepo repository.CredentialRepository,
	cache cache.CacheService,
) *UserService {
	return &UserService{
		userRepo,
		credRepo,
		cache,
	}
}

func (us *UserService) Register(ctx context.Context, user *models.User, password string) (*models.User, *models.Credential, error) {
	user, err := us.userRepo.CreateUser(ctx, user)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, nil, userPort.UserServiceConflictError
		}
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
		if errors.Is(err, repository.UserRepositoryGetUserNotFoundError) {
			return nil, userPort.UserServiceUserNotFoundError
		}
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
		return nil, userPort.UserServiceIncorrectPasswordError
	}
	return user, nil
}

func (us *UserService) Info(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user, err := us.userRepo.GetUserByID(ctx, id)

	if err != nil {
		if errors.Is(err, repository.UserRepositoryGetUserNotFoundError) {
			return nil, userPort.UserServiceUserNotFoundError
		}
		return nil, err
	}

	return user, nil
}

func (us *UserService) Logout(ctx context.Context, user *models.User, token string) error {
	err := us.cache.AddJWTToBlacklist(ctx, token)
	if err != nil {
		return err
	}

	return nil
}
