package main

import (
	"log"
	"net/http"
	"os"
	"server-go/auth"
	"server-go/database"

	_ "server-go/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

// @title Server API
// @version 1.0
// @description This is a sample server for the application.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@example.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /
// @schemes http

func init() {
	// Load environment variables
	os.Setenv("DB_HOST", "postgres")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "postgres")
	os.Setenv("DB_NAME", "postgres")
	os.Setenv("DB_PORT", "5432")
}

func main() {
	// 環境設定
	env := os.Getenv("APP_ENV")
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	database.InitDB()
	// ルーター初期化
	router := gin.Default()

	// ミドルウェア設定
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(DatabaseMiddleware(database.DB))

	// ルート設定
	setupRoutes(router)

	// Swaggerドキュメント設定
	router.GET(
		"/swagger/*any",
		ginSwagger.WrapHandler(swaggerFiles.Handler),
	) // ginSwagger.URL("http://localhost:8080/swagger/doc.json"),
	// ginSwagger.DefaultModelsExpandDepth(-1),

	// サーバー起動
	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	log.Printf("Server starting on %s in %s mode...", srv.Addr, env)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func DatabaseMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	}
}

func setupRoutes(router *gin.Engine) {
	// ヘルスチェック
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// メインルート
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "hello world",
		})
	})

	// API routes
	apiGroup := router.Group("/v1")
	{
		auth.RegisterAuthRoutes(apiGroup)
		
		// Protected routes
		protectedGroup := apiGroup.Group("")
		protectedGroup.Use(auth.AuthMiddleware())
		{
			server_sessions.RegisterServerSessionRoutes(protectedGroup)
		}
	}
}
