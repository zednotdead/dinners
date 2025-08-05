package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID       uuid.UUID `gorm:"primaryKey"`
	Username string    `gorm:"unique;notNull"`
	Email    string    `gorm:"unique"`
	Avatar   string
	Credentials []Credential
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID, err = uuid.NewV7()
	return err
}
