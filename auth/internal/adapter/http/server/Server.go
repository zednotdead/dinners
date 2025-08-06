package server

import (
	"github.com/gin-gonic/gin"
)

type Server struct {
	App  *gin.Engine
	Port string
}
