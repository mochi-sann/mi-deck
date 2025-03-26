package auth

import (
	"net/http"
	"server-go/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type SignUpRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Username string `json:"username" binding:"required"`
}

// Login godoc
// @Summary User login
// @Description Authenticate user and get access token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} map[string]string "Returns access token"
// @Failure 400 {object} map[string]string "Invalid request format"
// @Failure 401 {object} map[string]string "Invalid credentials"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /v1/auth/login [post]
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := GenerateToken(user.ID.String(), user.Email, *user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"accessToken": token})
}

// SignUp godoc
// @Summary Register new user
// @Description Create new user account and get access token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body SignUpRequest true "Sign up details"
// @Success 201 {object} map[string]string "Returns access token"
// @Failure 400 {object} map[string]string "Invalid request format"
// @Failure 409 {object} map[string]string "Email already exists"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /v1/auth/signup [post]
func SignUp(c *gin.Context) {
	var req SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := c.MustGet("db").(*gorm.DB)

	// Check if user exists
	var existingUser models.User
	if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	name := req.Username
	user := models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Name:     &name,
		UserRole: models.UserRoleUser,
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	token, err := GenerateToken(user.ID.String(), user.Email, *user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"accessToken": token})
}

// Me godoc
// @Summary Get current user profile
// @Description Get details of currently authenticated user
// @Tags auth
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]string "Returns user details"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /v1/auth/me [get]
func Me(c *gin.Context) {
	claims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userClaims := claims.(*Claims)
	c.JSON(http.StatusOK, gin.H{
		"id":    userClaims.UserID,
		"email": userClaims.Email,
		"name":  userClaims.Name,
	})
}

// Logout godoc
// @Summary Logout current user
// @Description Invalidate current session (client should discard token)
// @Tags auth
// @Accept json
// @Produce json
// @Security Bearer
// @Success 204 "No content"
// @Router /v1/auth/logout [post]
func Logout(c *gin.Context) {
	// JWT is stateless so logout is handled client-side by discarding the token
	c.Status(http.StatusNoContent)
}
