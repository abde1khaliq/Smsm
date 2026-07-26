package router

import (
	"github.com/abde1khaliq/Smsm/server/internal/api"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	AgentRouterGroup := r.Group("/agent")
	api.AgentRoutes(AgentRouterGroup)

	return r
}
