package main

import (
	"log"

	"your_project/internal/config"
	"your_project/internal/models"
)

func main() {
	db, err := config.NewDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// モデルをマイグレート
	err = db.AutoMigrate(
		&models.User{},
		&models.UserSetting{},
		&models.ServerSession{},
		&models.ServerInfo{},
		&models.UserInfo{},
		&models.Panel{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Migration completed successfully")
}
