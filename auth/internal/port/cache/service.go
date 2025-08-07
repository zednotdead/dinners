package cache

import "context"

type CacheService interface {
	AddJWTToBlacklist(ctx context.Context, jwt string) error
	IsJWTOnBlacklist(ctx context.Context, jwt string) (bool, error)
}
