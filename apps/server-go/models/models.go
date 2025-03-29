package models

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	UserRoleAdmin UserRole = "ADMIN"
	UserRoleUser  UserRole = "USER"
)

type User struct {
	ID            uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email         string          `gorm:"type:varchar(255);uniqueIndex;not null"`
	Name          *string         `gorm:"type:varchar(255)"`
	Password      string          `gorm:"type:varchar(255);not null" json:"-"`
	CreatedAt     time.Time       `gorm:"type:timestamptz;not null;default:now()"`
	UpdatedAt     time.Time       `gorm:"type:timestamptz;not null;default:now()"`
	ServerSession []ServerSession `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	UserSettings  []UserSetting   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	UserRole      UserRole        `gorm:"type:user_role;not null;default:'USER'"`
	UserInfo      []UserInfo      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`

	// Indexes
	Indexes []struct {
		gorm.Index
		Fields []string
		Type   string
	} `gorm:"index:,type:hash"`
}

type UserSetting struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID    uuid.UUID `gorm:"type:uuid;index"`
	User      User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Key       string    `gorm:"not null"`
	Value     string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type ServerType string

const (
	ServerTypeMisskey     ServerType = "Misskey"
	ServerTypeOtherServer ServerType = "OtherServer"
)

type ServerSession struct {
	ID             uuid.UUID   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID         uuid.UUID   `gorm:"type:uuid;index:idx_server_session_user"`
	User           User        `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Origin         string      `gorm:"type:varchar(255);not null"`
	ServerToken    string      `gorm:"type:varchar(255);not null"`
	ServerType     ServerType  `gorm:"type:server_type;not null"`
	CreatedAt      time.Time   `gorm:"type:timestamptz;not null;default:now()"`
	UpdatedAt      time.Time   `gorm:"type:timestamptz;not null;default:now()"`
	Panels         []Panel     `gorm:"foreignKey:ServerSessionID;constraint:OnDelete:CASCADE"`
	ServerInfo     *ServerInfo `gorm:"foreignKey:ServerSessionID;constraint:OnDelete:CASCADE"`
	ServerUserInfo *UserInfo   `gorm:"foreignKey:ServerSessionID;constraint:OnDelete:CASCADE"`

	// Composite unique index for origin and user_id
	Indexes []struct {
		gorm.Index
		Fields []string
		Unique bool
	} `gorm:"index:,unique;composite:origin,user_id"`
}

type ServerInfo struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ServerSessionID uuid.UUID     `gorm:"type:uuid;uniqueIndex"`
	ServerSession   ServerSession `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Name            string        `gorm:"not null"`
	IconUrl         string        `gorm:"column:icon_url"`
	FaviconUrl      string        `gorm:"column:favicon_url"`
	ThemeColor      string        `gorm:"column:theme_color"`
	CreatedAt       time.Time     `gorm:"autoCreateTime"`
	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`
}

type UserInfo struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Name            string        `gorm:"not null"`
	Username        string        `gorm:"not null"`
	AvatarUrl       string        `gorm:"column:avatar_url"`
	CreatedAt       time.Time     `gorm:"autoCreateTime"`
	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`
	ServerSession   ServerSession `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:ServerSessionID"`
	ServerSessionID uuid.UUID     `gorm:"type:uuid;uniqueIndex"`
	User            *User         `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;foreignKey:UserID"`
	UserID          *uuid.UUID    `gorm:"type:uuid"`
}

type Panel struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ServerSessionID uuid.UUID     `gorm:"type:uuid;index"`
	ServerSession   ServerSession `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Type            string        `gorm:"not null"`
}
