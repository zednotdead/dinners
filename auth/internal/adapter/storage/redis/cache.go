package redis

import (
	"context"
	"errors"
	"time"

	valkey "github.com/valkey-io/valkey-go"
)

type RedisCache struct{}

var redis valkey.Client

func NewRedisCache(client valkey.Client) *RedisCache {
	redis = client

	return &RedisCache{}
}

func (rc *RedisCache) AddJWTToBlacklist(ctx context.Context, jwt string) error {
	cmd := redis.B().
		Set().
		Key(jwt).
		Value("blacklisted").
		Ex(24 * time.Hour).
		Build()

	err := redis.Do(ctx, cmd).Error()

	return err
}

func (rc *RedisCache) IsJWTOnBlacklist(ctx context.Context, jwt string) (bool, error) {
	cmd := redis.B().
		Get().
		Key(jwt).
		Build()

	res, err := redis.Do(ctx, cmd).ToString()
	if err != nil {
		if errors.Is(err, valkey.Nil) {
			return false, nil
		}
		return false, err
	}

	return res == "blacklisted", nil
}
