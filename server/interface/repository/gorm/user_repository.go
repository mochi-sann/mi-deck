package gorm_repository

import (
	"mi-deck-api/domain/model"
	"mi-deck-api/domain/repository"

	"gorm.io/gorm"
)


type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repository.UserRepository {
    return &UserRepository{db: db}
}

// FindByEmail メソッドの実装
func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
    var user model.User
    if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

// Create メソッドの実装
func (r *UserRepository) Create(user *model.User) error {
    if err := r.db.Create(user).Error; err != nil {
        return err
    }
    return nil
}

// ExistsByEmail メソッドの実装
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
    var count int64
    if err := r.db.Model(&model.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
        return false, err
    }
    return count > 0, nil
}
