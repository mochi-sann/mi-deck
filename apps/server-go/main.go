package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// 環境設定
	env := os.Getenv("APP_ENV")
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// ルーター初期化
	router := gin.Default()

	// ミドルウェア設定
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// ルート設定
	setupRoutes(router)

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
			"message": "こんにちは",
		})
	})

	// API v1 グループ
	v1 := router.Group("/api/v1")
	{
		// ここにAPIルートを追加
	}
}
