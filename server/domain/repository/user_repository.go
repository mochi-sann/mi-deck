package repository

import "mi-deck-api/domain/model"


type UserRepository interface {
    FindByEmail(email string) (*model.User, error)
    Create(user *model.User) error
    ExistsByEmail(email string) (bool, error)
}
