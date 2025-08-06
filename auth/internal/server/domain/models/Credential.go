package models

import (
	"github.com/google/uuid"
)

type Credential struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	PasswordHash string
}
