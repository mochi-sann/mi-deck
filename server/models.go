package main

import (
    "gorm.io/gorm"
    "time"
)

type User struct {
    ID        string `gorm:"primaryKey;size:36"`
    Email     string `gorm:"uniqueIndex"`
    Password  string
    Username  string `gorm:"uniqueIndex"`
    CreatedAt time.Time
    UpdatedAt time.Time
    Sessions  []ServerSession
}

type ServerSession struct {
    ID          string `gorm:"primaryKey;size:36"`
    UserID      string
    User        User `gorm:"foreignKey:UserID"`
    Origin      string
    ServerToken string
    ServerType  string
    CreatedAt   time.Time
    UpdatedAt   time.Time
    ServerInfo  ServerInfo `gorm:"foreignKey:ServerSessionID"`
}

type ServerInfo struct {
    ID              string `gorm:"primaryKey;size:36"`
    ServerSessionID string `gorm:"uniqueIndex"`
    Name            string
    IconUrl         string
    FaviconUrl      string
    ThemeColor      string
    CreatedAt       time.Time
    UpdatedAt       time.Time
}
