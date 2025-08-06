package main

import (
	"fmt"
	"io"
	"os"

	"ariga.io/atlas-provider-gorm/gormschema"
	"github.com/zednotdead/dinners/auth/internal/adapter/storage/postgres/repository/models"
)

func main() {
	stmts, err := gormschema.New("postgres").Load(
		&models.User{},
		&models.Credential{},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load gorm schema: %v\n", err)
		os.Exit(1)
	}
	io.WriteString(os.Stdout, stmts)
}
