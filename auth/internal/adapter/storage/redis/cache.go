package redis

import "context"

type RedisCache struct {
}

func NewRedisCache() *RedisCache {
	return &RedisCache{}
}

func (rc *RedisCache) AddJWTToBlacklist(ctx context.Context, jwt string) error {
	return nil
}

func (rc *RedisCache) IsJWTOnBlacklist(ctx context.Context, jwt string) (bool, error) {
	return false, nil
}
