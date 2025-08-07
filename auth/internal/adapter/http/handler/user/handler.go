package user

import (
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/zednotdead/dinners/auth/internal/port/cache"
	jwtPort "github.com/zednotdead/dinners/auth/internal/port/jwt"
	userPort "github.com/zednotdead/dinners/auth/internal/port/user"
)

var (
	validate                    = validator.New()
	UserHandlerNotLoggedInError = errors.New("User is not logged in.")
)

type UserHandler struct {
	svc        userPort.UserService
	jwt        jwtPort.JwtService
	cache      cache.CacheService
	expiration time.Duration
}

func NewUserHandler(svc userPort.UserService, jwtsvc jwtPort.JwtService, cache cache.CacheService) *UserHandler {
	return &UserHandler{
		svc:        svc,
		jwt:        jwtsvc,
		cache:      cache,
		expiration: 24 * time.Hour,
	}
}
