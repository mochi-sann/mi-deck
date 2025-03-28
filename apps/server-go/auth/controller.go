package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.RouterGroup) {
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/login", Login)
		authGroup.POST("/signup", SignUp)
		authGroup.GET("/me", AuthMiddleware(), Me)
		authGroup.POST("/logout", AuthMiddleware(), Logout)
	}
}
