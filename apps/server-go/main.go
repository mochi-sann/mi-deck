package main

import (
	"log"
	"net/http"
	"os"
	"server-go/database"
	"server-go/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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

func getUsers(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var users []models.User
	if err := db.Preload("ServerSession").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func getUser(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var user models.User
	if err := db.Preload("ServerSession").First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func createUser(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
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
	// API v1 グループ
	v1 := router.Group("/api/v1")
	{
		v1.GET("/users", getUsers)
		v1.GET("/users/:id", getUser)
		v1.POST("/users", createUser)
		// 他のAPIルートを追加
	}
}
