package models

import (
	"time"
	
	"gorm.io/gorm"
)

type UserRole string

const (
	UserRoleAdmin UserRole = "ADMIN"
	UserRoleUser  UserRole = "USER"
)

type User struct {
	gorm.Model
	ID           string         `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Email        string         `gorm:"unique;not null"`
	Name         *string        `gorm:"size:255"`
	Password     string         `gorm:"not null"`
	CreatedAt    time.Time      `gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime"`
	UserRole     UserRole       `gorm:"type:user_role;default:'USER'"`
	ServerSessions []ServerSession `gorm:"foreignKey:UserID"`
	UserSettings []UserSetting  `gorm:"foreignKey:UserID"`
	UserInfos    []UserInfo     `gorm:"foreignKey:UserID"`
}

type UserSetting struct {
	gorm.Model
	ID        string    `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID    string    `gorm:"type:uuid;index"`
	User      User      `gorm:"foreignKey:UserID"`
	Key       string    `gorm:"not null"`
	Value     string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type ServerType string

const (
	ServerTypeMisskey    ServerType = "Misskey"
	ServerTypeOtherServer ServerType = "OtherServer"
)

type ServerSession struct {
	gorm.Model
	ID           string       `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID       string       `gorm:"type:uuid;index"`
	User         User         `gorm:"foreignKey:UserID"`
	Origin       string       `gorm:"not null;uniqueIndex:idx_origin_user_id"`
	ServerToken  string       `gorm:"not null"`
	ServerType   ServerType   `gorm:"type:server_type;not null"`
	CreatedAt    time.Time    `gorm:"autoCreateTime"`
	UpdatedAt    time.Time    `gorm:"autoUpdateTime"`
	Panels       []Panel      `gorm:"foreignKey:ServerSessionID"`
	ServerInfo   *ServerInfo  `gorm:"foreignKey:ServerSessionID"`
	ServerUserInfo *UserInfo  `gorm:"foreignKey:ServerSessionID"`
}

type ServerInfo struct {
	gorm.Model
	ID              string         `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ServerSessionID string         `gorm:"type:uuid;unique;index"`
	ServerSession   ServerSession  `gorm:"foreignKey:ServerSessionID"`
	Name            string         `gorm:"not null"`
	IconUrl         string         `gorm:"column:icon_url"`
	FaviconUrl      string         `gorm:"column:favicon_url"`
	ThemeColor      string         `gorm:"column:theme_color"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
}

type UserInfo struct {
	gorm.Model
	ID              string         `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Name            string         `gorm:"not null"`
	Username        string         `gorm:"not null"`
	AvatarUrl       string         `gorm:"column:avatar_url"`
	CreatedAt       time.Time      `gorm:"autoCreateTime"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime"`
	ServerSessionID string         `gorm:"type:uuid;unique;index"`
	ServerSession   ServerSession  `gorm:"foreignKey:ServerSessionID"`
	UserID          *string        `gorm:"type:uuid"`
	User            *User          `gorm:"foreignKey:UserID"`
}

type Panel struct {
	gorm.Model
	ID              string         `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ServerSessionID string         `gorm:"type:uuid;index"`
	ServerSession   ServerSession  `gorm:"foreignKey:ServerSessionID"`
	Type            string         `gorm:"not null"`
}
