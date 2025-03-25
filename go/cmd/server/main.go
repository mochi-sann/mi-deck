package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"your_project/internal/api/auth"
	"your_project/internal/config"
	"your_project/internal/repositories"
	"your_project/internal/services"
	"your_project/pkg/middleware"
)

func main() {
	// 環境変数の設定確認
	requiredEnvVars := []string{"DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "DB_PORT"}
	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			log.Fatalf("Environment variable %s is required", envVar)
		}
	}

	// データベース接続
	db, err := config.NewDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// リポジトリ初期化
	userRepo := repositories.NewUserRepository(db)

	// サービス初期化
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	authService := services.NewAuthService(userRepo, jwtSecret)

	// ハンドラ初期化
	authHandler := auth.NewAuthHandler(authService)

	// ルーター設定
	r := gin.Default()

	// ヘルスチェックエンドポイント
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// 認証ルート
	authRoutes := r.Group("/api/v1/auth")
	{
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/signup", authHandler.SignUp)
	}

	// 認証が必要なルート
	authenticated := r.Group("/api/v1")
	authenticated.Use(middleware.AuthMiddleware(jwtSecret))
	{
		authenticated.GET("/me", authHandler.GetProfile)
		authenticated.POST("/logout", authHandler.Logout)
	}

	// サーバー起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
