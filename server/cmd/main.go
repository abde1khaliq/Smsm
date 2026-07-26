package main

import (
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		resp, err := http.Get("http://localhost:11434/api/tags")
		if err != nil {
    		log.Panic(err)
		}
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)

		c.String(http.StatusOK, string(body))
	})

	r.LoadHTMLGlob("templates/*")

	r.Run(":8080")
}