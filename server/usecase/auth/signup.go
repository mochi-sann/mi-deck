package auth

import (
	"errors"
	"mi-deck-api/domain/model"
	"mi-deck-api/domain/repository"

	"golang.org/x/crypto/bcrypt"
)

var (
    ErrEmailAlreadyExists = errors.New("email already exists")
)

type SignupUseCase struct {
    userRepo repository.UserRepository
}

func NewSignupUseCase(r repository.UserRepository) *SignupUseCase {
    return &SignupUseCase{userRepo: r}
}

func (uc *SignupUseCase) Execute(email, password, username string) (*model.User, error) {
    // メールアドレスの重複チェック
    exists, err := uc.userRepo.ExistsByEmail(email)
    if err != nil {
        return nil, err
    }
    if exists {
        return nil, ErrEmailAlreadyExists
    }

    // パスワードのハッシュ化
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return nil, err
    }

    // ユーザー作成
    user := &model.User{
        Email:    email,
        Password: string(hashedPassword),
        Username: username,
    }

    if err := uc.userRepo.Create(user); err != nil {
        return nil, err
    }

    return user, nil
}
