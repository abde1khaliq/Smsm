package main

import (
	"log"

	"github.com/abde1khaliq/Smsm/server/config"
	"github.com/abde1khaliq/Smsm/server/internal/router"
)

func main() {
	config.Load()
	log.Println("Starting on port:", config.App.Port)

	r := router.SetupRouter()
	r.Run(":" + config.App.Port)
}
