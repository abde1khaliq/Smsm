package services

import (
	"io"
	"log"
	"net/http"
	"time"

	"github.com/abde1khaliq/Smsm/server/config"
	"github.com/gin-gonic/gin"
)

var httpClient = &http.Client{Timeout: 12 * time.Second}

func CheckHealth() gin.HandlerFunc {
	return func(c *gin.Context) {
		resp, err := httpClient.Get(config.App.OllamaURL + "/api/tags")
		if err != nil {
			log.Println("Ollama health check failed:", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "down", "error": err.Error()})
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read response"})
			return
		}
		c.String(http.StatusOK, string(body))
	}
}
