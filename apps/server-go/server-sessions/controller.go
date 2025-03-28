package server_sessions

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterServerSessionRoutes(router *gin.RouterGroup) {
	sessionGroup := router.Group("/server-sessions")
	{
		sessionGroup.POST("", CreateServerSession)
		sessionGroup.GET("", ListServerSessions)
		sessionGroup.POST("/update-server-info", UpdateServerInfo)
	}
}

func CreateServerSession(c *gin.Context) {
	// TODO: Implement
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Not implemented"})
}

func ListServerSessions(c *gin.Context) {
	// TODO: Implement 
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Not implemented"})
}

func UpdateServerInfo(c *gin.Context) {
	// TODO: Implement
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Not implemented"})
}
