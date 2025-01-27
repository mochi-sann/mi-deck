package main

import (
	"mi-deck-api/interface/handler"
	"mi-deck-api/usecase/auth"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func main() {
    // データベース初期化
    db := database.NewGormDB()

    // リポジトリの初期化
    userRepo := gorm.NewUserRepository(db)

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
            authGroup.POST("/login", authHandler.Signup)
            authGroup.POST("/signup", authHandler.Signup)
        }
    }

    r.Run(":3000")
}
