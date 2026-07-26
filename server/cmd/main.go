package main

import "github.com/abde1khaliq/Smsm/server/internal/router"

func main() {
	r := router.SetupRouter()
	r.LoadHTMLGlob("templates/*")
	r.Run(":8080")
}
