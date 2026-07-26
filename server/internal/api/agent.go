package api

import (
	"github.com/abde1khaliq/Smsm/server/internal/services"
	"github.com/gin-gonic/gin"
)

func AgentRoutes(r *gin.RouterGroup) {
	r.GET("/health", services.CheckHealth())
}
