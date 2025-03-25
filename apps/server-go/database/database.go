package database

import (
	"fmt"
	"log"
	"os"
	"server-go/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")

	// Enable required extensions
	err = DB.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error
	if err != nil {
		log.Fatalf("Failed to create uuid-ossp extension: %v", err)
	}

	// Create custom enum types first
	err = DB.Exec(`CREATE TYPE user_role AS ENUM ('ADMIN', 'USER')`).Error
	if err != nil {
		log.Printf("Note: user_role enum may already exist: %v", err)
	}

	err = DB.Exec(`CREATE TYPE server_type AS ENUM ('Misskey', 'OtherServer')`).Error
	if err != nil {
		log.Printf("Note: server_type enum may already exist: %v", err)
	}

	// Auto migrate all models
	err = DB.AutoMigrate(
		&models.User{},
		&models.UserSetting{},
		&models.ServerSession{},
		&models.ServerInfo{},
		&models.UserInfo{},
		&models.Panel{},
	)
	if err != nil {
		log.Fatalf("Failed to auto migrate models: %v", err)
	}

	log.Println("Database migration completed")
}
