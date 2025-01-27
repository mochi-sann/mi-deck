package main

import (
	"mi-deck-api/infrastructure/database"
	"mi-deck-api/interface/handler"
	"mi-deck-api/interface/repository/gorm"
	"mi-deck-api/usecase/auth"

	"github.com/gin-gonic/gin"
)

func main() {
	// データベース初期化
	db := database.NewGormDB()

	// リポジトリの初期化
	userRepo := gorm_repository.NewUserRepository(db)

	// ユースケースの初期化
	loginUseCase := auth.NewLoginUseCase(userRepo)
	signupUseCase := auth.NewSignupUseCase(userRepo)

	// ハンドラの初期化
	authHandler := handler.NewAuthHandler(loginUseCase, signupUseCase)

	// ルーティング設定
	r := gin.Default()
	api := r.Group("/v1")
	{
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/signup", authHandler.Signup)
		}
	}

	r.Run(":3000")
}
