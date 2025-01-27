package handler

import (
	"mi-deck-api/usecase/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
    loginUseCase  *auth.LoginUseCase
    signupUseCase *auth.SignupUseCase
}

func NewAuthHandler(l *auth.LoginUseCase, s *auth.SignupUseCase) *AuthHandler {
    return &AuthHandler{
        loginUseCase:  l,
        signupUseCase: s,
    }
}

func (h *AuthHandler) Signup(c *gin.Context) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
        Username string `json:"username"`
    }

    if err := c.BindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
        return
    }

    user, err := h.signupUseCase.Execute(req.Email, req.Password, req.Username)
    if err != nil {
        if err == auth.ErrEmailAlreadyExists {
            c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "id":       user.ID,
        "email":    user.Email,
        "username": user.Username,
    })
}
