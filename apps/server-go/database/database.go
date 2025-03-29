package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func runMigrations(db *gorm.DB) error {
	// Create migrations table if not exists
	err := db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version BIGINT PRIMARY KEY,
		dirty BOOLEAN NOT NULL
	)`).Error
	if err != nil {
		return err
	}

	// Get current migration version
	var currentVersion int64
	var dirty bool
	db.Raw("SELECT version, dirty FROM schema_migrations ORDER BY version DESC LIMIT 1").Scan(&currentVersion, &dirty)

	if dirty {
		return fmt.Errorf("database is in dirty state, manual intervention required")
	}

	// Find migration files
	migrationFiles, err := filepath.Glob("migrations/*.up.sql")
	if err != nil {
		return err
	}

	// Sort migrations by version
	sort.Slice(migrationFiles, func(i, j int) bool {
		verI := getMigrationVersion(migrationFiles[i])
		verJ := getMigrationVersion(migrationFiles[j])
		return verI < verJ
	})

	// Run new migrations
	for _, file := range migrationFiles {
		version := getMigrationVersion(file)
		if version <= currentVersion {
			continue
		}

		// Read migration file
		content, err := os.ReadFile(file)
		if err != nil {
			return err
		}

		// Start transaction
		tx := db.Begin()
		if tx.Error != nil {
			return tx.Error
		}

		// Mark as dirty
		if err := tx.Exec("INSERT INTO schema_migrations (version, dirty) VALUES (?, true)", version).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Execute migration
		if err := tx.Exec(string(content)).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Update version and clear dirty flag
		if err := tx.Exec("UPDATE schema_migrations SET dirty = false WHERE version = ?", version).Error; err != nil {
			tx.Rollback()
			return err
		}

		if err := tx.Commit().Error; err != nil {
			return err
		}

		log.Printf("Applied migration %d", version)
	}

	return nil
}

func getMigrationVersion(filename string) int64 {
	base := filepath.Base(filename)
	parts := strings.Split(base, "_")
	if len(parts) == 0 {
		return 0
	}
	version, _ := strconv.ParseInt(parts[0], 10, 64)
	return version
}

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

	// Run SQL migrations
	err = runMigrations(DB)
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Database migration completed")
}
