package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func main() {
	// データベース初期化
	var err error
	db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// マイグレーション
	db.AutoMigrate(&User{}, &ServerSession{}, &ServerInfo{})

	r := gin.Default()

	// ルート定義
	auth := r.Group("/v1/auth")
	{
		auth.POST("/login", login)
		auth.POST("/signUp", signUp)
		auth.GET("/me", authMiddleware(), getProfile)
		auth.POST("/logout", logout)
	}

	serverSessions := r.Group("/v1/server-sessions")
	serverSessions.Use(authMiddleware())
	{
		serverSessions.POST("", createServerSession)
		serverSessions.GET("", getServerSessions)
		serverSessions.POST("/update-server-info", updateServerInfo)
		serverSessions.PUT("/:id", updateServerSession)
		serverSessions.DELETE("/:id", deleteServerSession)
	}
	fmt.Println("start server")

	r.Run(":3000")
}

// 認証ミドルウェア
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")[7:] // Bearer を除去

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Set("userID", claims["userID"])
		c.Next()
	}
}

// 認証ハンドラ
func login(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BindJSON(&loginData); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	var user User
	if result := db.Where("email = ?", loginData.Email).First(&user); result.Error != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password)); err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.ID,
		"exp":    time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, _ := token.SignedString(jwtSecret)
	c.JSON(http.StatusOK, gin.H{"accessToken": tokenString})
}

// ユーザー登録
func signUp(c *gin.Context) {
	var signUpData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Username string `json:"username"`
	}

	if err := c.BindJSON(&signUpData); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(signUpData.Password), bcrypt.DefaultCost)
	user := User{
		Email:    signUpData.Email,
		Password: string(hashedPassword),
		Username: signUpData.Username,
	}

	if result := db.Create(&user); result.Error != nil {
		c.AbortWithStatus(http.StatusConflict)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.ID,
		"exp":    time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, _ := token.SignedString(jwtSecret)
	c.JSON(http.StatusCreated, gin.H{"accessToken": tokenString})
}

// サーバーセッション作成
func createServerSession(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	var sessionData struct {
		Origin       string `json:"origin"`
		SessionToken string `json:"sessionToken"`
		ServerType   string `json:"serverType"`
	}

	if err := c.BindJSON(&sessionData); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	session := ServerSession{
		UserID:      userID,
		Origin:      sessionData.Origin,
		ServerToken: sessionData.SessionToken,
		ServerType:  sessionData.ServerType,
		ServerInfo: ServerInfo{
			Name:       "Example Server",
			IconUrl:    "https://example.com/icon.png",
			FaviconUrl: "https://example.com/favicon.ico",
			ThemeColor: "#ffffff",
		},
	}

	db.Create(&session)
	c.JSON(http.StatusCreated, session)
}

// その他のハンドラ実装...
