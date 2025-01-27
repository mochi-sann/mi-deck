package auth

import (
	"mi-deck-api/domain/repository"

	"golang.org/x/crypto/bcrypt"
)

type LoginUseCase struct {
    userRepo repository.UserRepository
}

func NewLoginUseCase(r repository.UserRepository) *LoginUseCase {
    return &LoginUseCase{userRepo: r}
}

func (uc *LoginUseCase) Execute(email, password string) (string, error) {
    user, err := uc.userRepo.FindByEmail(email)
    if err != nil {
        return "", ErrUserNotFound
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
        return "", ErrInvalidPassword
    }

    // トークン生成ロジック（JWTなど）
    return "generated_token", nil
}
