package main

import (
	"log"
	"net/http"
	"os"
	"server-go/database"
	"server-go/routes"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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
	router.Use(DatabaseMiddleware())

	// ルート設定
	setupRoutes(router)
	
	// Swaggerドキュメント
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

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

func DatabaseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", database.DB)
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

	// Auth routes
	authGroup := router.Group("/api/v1/auth")
	{
		authGroup.POST("/login", auth.Login)
		authGroup.POST("/signup", auth.SignUp)
	}

	// API v1 グループ
	v1 := router.Group("/api/v1")
	v1.Use(auth.AuthMiddleware())
	{
		v1.GET("/users", routes.GetUsers)
		v1.GET("/users/:id", routes.GetUser)
		v1.POST("/users", routes.CreateUser)
		v1.GET("/auth/me", auth.Me)
		// 他のAPIルートを追加
	}
}
