package main

import (
	"time"
  "github.com/google/uuid"
)

// Enum definitions
type UserRoleType string

const (
	AdminRole UserRoleType = "ADMIN"
	UserRole  UserRoleType = "USER"
)

type ServerType string

const (
	MisskeyType     ServerType = "Misskey"
	OtherServerType ServerType = "OtherServer"
)

// Model definitions
type User struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Email          string    `gorm:"unique;not null"`
	UserName       *string
	Password       string          `gorm:"not null"`
	CreatedAt      time.Time       `gorm:"column:created_at"`
	UpdatedAt      time.Time       `gorm:"column:updated_at"`
	UserRole       UserRoleType    `gorm:"column:user_role;default:USER"`
	ServerSessions []ServerSession `gorm:"foreignKey:UserID"`
	UserSettings   []UserSetting   `gorm:"foreignKey:UserID"`
	UserInfos      []UserInfo      `gorm:"foreignKey:UserID"`
}

func (User) TableName() string { return "user" }

type UserSetting struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID    uuid.UUID `gorm:"type:uuid;column:user_id;index"`
	Key       string    `gorm:"not null"`
	Value     string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"column:created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at"`
	User      User      `gorm:"foreignKey:UserID"`
}

func (UserSetting) TableName() string { return "user_setting" }

type ServerSession struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID         uuid.UUID  `gorm:"type:uuid;column:user_id;index"`
	Origin         string     `gorm:"not null"`
	ServerToken    string     `gorm:"column:server_token;not null"`
	ServerType     ServerType `gorm:"column:server_type;not null"`
	CreatedAt      time.Time  `gorm:"column:created_at"`
	UpdatedAt      time.Time  `gorm:"column:updated_at"`
	Panels         []Panel    `gorm:"foreignKey:ServerSessionID"`
	ServerInfo     ServerInfo `gorm:"foreignKey:ServerSessionID"`
	ServerUserInfo UserInfo   `gorm:"foreignKey:ServerSessionID"`
	User           User       `gorm:"foreignKey:UserID"`
}

func (ServerSession) TableName() string { return "server_session" }

type ServerInfo struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ServerSessionID uuid.UUID     `gorm:"type:uuid;column:server_session_id;uniqueIndex"`
	Name            string        `gorm:"not null"`
	IconURL         string        `gorm:"column:icon_url"`
	FaviconURL      string        `gorm:"column:favicon_url"`
	ThemeColor      string        `gorm:"column:theme_color"`
	CreatedAt       time.Time     `gorm:"column:created_at"`
	UpdatedAt       time.Time     `gorm:"column:updated_at"`
	ServerSession   ServerSession `gorm:"foreignKey:ServerSessionID"`
}

func (ServerInfo) TableName() string { return "server_info" }

type UserInfo struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Name            string        `gorm:"not null"`
	Username        string        `gorm:"not null"`
	AvatarURL       string        `gorm:"column:avater_url"`
	CreatedAt       time.Time     `gorm:"column:created_at"`
	UpdatedAt       time.Time     `gorm:"column:updated_at"`
	ServerSessionID uuid.UUID     `gorm:"type:uuid;column:server_s_ession_id;uniqueIndex"`
	UserID          *uuid.UUID    `gorm:"type:uuid"`
	ServerSession   ServerSession `gorm:"foreignKey:ServerSessionID"`
	User            *User         `gorm:"foreignKey:UserID"`
}

func (UserInfo) TableName() string { return "user_info" }

type Panel struct {
	ID              uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ServerSessionID uuid.UUID     `gorm:"type:uuid;column:server_session_id;index"`
	Type            string        `gorm:"not null"`
	ServerSession   ServerSession `gorm:"foreignKey:ServerSessionID"`
}

func (Panel) TableName() string { return "panel" }
