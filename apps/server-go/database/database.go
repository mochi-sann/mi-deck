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
	// First connect to default postgres database to check/create our db
	adminDsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_PORT"),
	)
	
	adminDB, err := gorm.Open(postgres.Open(adminDsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("Failed to connect to admin database: %v", err)
	}

	// Create database if it doesn't exist
	err = adminDB.Exec("CREATE DATABASE newdb").Error
	if err != nil {
		log.Printf("Note: database may already exist: %v", err)
	}

	// Now connect to our application database
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=newdb port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_PORT"),
	)
	log.Println(dsn)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to application database: %v", err)
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
