package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"your_project/internal/api/auth"
	"your_project/internal/config"
	"your_project/internal/models"
	"your_project/internal/repositories"
	"your_project/internal/services"
	"your_project/pkg/middleware"
)

func main() {
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
		jwtSecret = "default-secret-key" // 本番環境では必ず環境変数で設定
	}
	authService := services.NewAuthService(userRepo, jwtSecret)

	// ハンドラ初期化
	authHandler := auth.NewAuthHandler(authService)

	// ルーター設定
	r := gin.Default()

	// 認証ルート
	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/signup", authHandler.SignUp)
	}

	// 認証が必要なルート
	authenticated := r.Group("/")
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
	r.Run(":" + port)
}
