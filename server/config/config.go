package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	OllamaURL string
	Port      string
}

var App Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	App = Config{
		OllamaURL: getEnv("OLLAMA_URL", "http://localhost:11434"),
		Port:      getEnv("PORT", "8000"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
