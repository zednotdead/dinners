package service

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

type JwtService struct {
	key []byte
}

func NewJwtService(key string) *JwtService {
	return &JwtService{
		key: []byte(key),
	}
}

func (svc *JwtService) SignToken(claims jwt.Claims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(svc.key)

	return tokenString, err
}

func (svc *JwtService) DecodeToken(tokenString string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&jwt.RegisteredClaims{},
		func(token *jwt.Token) (any, error) {
			return svc.key, nil
		},
	)

	if err != nil {
		return nil, err
	} else if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok {
		return claims, nil
	} else {
		return nil, errors.New("Could not get claims from token")
	}
}
