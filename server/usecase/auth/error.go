package auth

import "errors"

var (
    ErrUserNotFound    = errors.New("user not found")
    ErrInvalidPassword = errors.New("invalid password")
    ErrEmailAlreadyExist = errors.New("email already exists")
)
