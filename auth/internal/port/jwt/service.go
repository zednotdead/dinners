package jwt

import "github.com/golang-jwt/jwt/v5"

type JwtService interface {
	SignToken(claims jwt.Claims) (string, error)
	DecodeToken(tokenString string) (*jwt.RegisteredClaims, error)
}
