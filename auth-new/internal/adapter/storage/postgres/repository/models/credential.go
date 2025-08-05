package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Credential struct {
	gorm.Model
	ID           uuid.UUID `gorm:"primaryKey"`
	UserID       uuid.UUID
	PasswordHash string
}

func (c *Credential) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID, err = uuid.NewV7()

	return err
}
