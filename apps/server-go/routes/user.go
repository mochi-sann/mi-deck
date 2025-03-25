package routes

import (
	"net/http"
	"server-go/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// getUsers godoc
// @Summary Get all users
// @Description Get a list of all users
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {array} models.User
// @Failure 500 {object} map[string]string
// @Router /api/v1/users [get]
func GetUsers(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var users []models.User
	if err := db.Preload("ServerSession").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetUser godoc
// @Summary Get a user by ID
// @Description Get user details by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /api/v1/users/{id} [get]
func GetUser(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	id := c.Param("id")

	var user models.User
	if err := db.Preload("ServerSession").First(&user, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// CreateUser godoc
// @Summary Create a new user
// @Description Create a new user with name, email and password
// @Tags users
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "User data"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/users [post]
func CreateUser(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create new user from request
	user := models.User{
		Name:     &req.Name,
		Email:    req.Email,
		Password: req.Password, // Note: In production, you should hash the password
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}
