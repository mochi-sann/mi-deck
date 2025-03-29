package controllers

import (
	"net/http"
	"server-go/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ServerSessionsController struct {
	db *gorm.DB
}

func NewServerSessionsController(db *gorm.DB) *ServerSessionsController {
	return &ServerSessionsController{db: db}
}

type CreateServerSessionRequest struct {
	Origin     string `json:"origin" binding:"required,url"`
	ServerType string `json:"serverType" binding:"required,oneof=Misskey OtherServer"`
}

// CreateServerSession creates a new server session
// @Summary Create a server session
// @Description Create a new server session for the authenticated user
// @Tags ServerSessions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param input body CreateServerSessionRequest true "Server session data"
// @Success 201 {object} models.ServerSession
// @Failure 400 {object} auth.ErrorResponse
// @Failure 401 {object} auth.ErrorResponse
// @Failure 500 {object} auth.ErrorResponse
// @Router /v1/server-sessions [post]
func (c *ServerSessionsController) CreateServerSession(ctx *gin.Context) {
	var req CreateServerSessionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from context
	user, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Create server session
	session := models.ServerSession{
		UserID:     user.(*models.User).ID,
		Origin:     req.Origin,
		ServerType: models.ServerType(req.ServerType),
		ServerToken: uuid.New().String(),
	}

	if err := c.db.Create(&session).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create server session"})
		return
	}

	ctx.JSON(http.StatusCreated, session)
}

// ListServerSessions lists all server sessions for the authenticated user
// @Summary List server sessions
// @Description Get all server sessions for the authenticated user
// @Tags ServerSessions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {array} models.ServerSession
// @Failure 401 {object} auth.ErrorResponse
// @Failure 500 {object} auth.ErrorResponse
// @Router /v1/server-sessions [get]
func (c *ServerSessionsController) ListServerSessions(ctx *gin.Context) {
	// Get user from context
	user, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var sessions []models.ServerSession
	if err := c.db.Where("user_id = ?", user.(*models.User).ID).Find(&sessions).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get server sessions"})
		return
	}

	ctx.JSON(http.StatusOK, sessions)
}

type UpdateServerInfoRequest struct {
	Name       string `json:"name"`
	IconUrl    string `json:"iconUrl"`
	FaviconUrl string `json:"faviconUrl"`
	ThemeColor string `json:"themeColor"`
}

// UpdateServerInfo updates server information
// @Summary Update server info
// @Description Update server information for a session
// @Tags ServerSessions
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Server Session ID"
// @Param input body UpdateServerInfoRequest true "Server info data"
// @Success 200 {object} models.ServerInfo
// @Failure 400 {object} auth.ErrorResponse
// @Failure 401 {object} auth.ErrorResponse
// @Failure 404 {object} auth.ErrorResponse
// @Failure 500 {object} auth.ErrorResponse
// @Router /v1/server-sessions/{id}/info [put]
func (c *ServerSessionsController) UpdateServerInfo(ctx *gin.Context) {
	sessionID := ctx.Param("id")
	if _, err := uuid.Parse(sessionID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var req UpdateServerInfoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from context
	user, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if session belongs to user
	var session models.ServerSession
	if err := c.db.Where("id = ? AND user_id = ?", sessionID, user.(*models.User).ID).First(&session).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Server session not found"})
		return
	}

	// Create or update server info
	serverInfo := models.ServerInfo{
		ServerSessionID: session.ID,
		Name:            req.Name,
		IconUrl:         req.IconUrl,
		FaviconUrl:      req.FaviconUrl,
		ThemeColor:      req.ThemeColor,
	}

	if err := c.db.Where("server_session_id = ?", session.ID).
		Assign(serverInfo).
		FirstOrCreate(&serverInfo).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update server info"})
		return
	}

	ctx.JSON(http.StatusOK, serverInfo)
}
