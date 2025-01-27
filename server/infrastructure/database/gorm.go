package database

import (
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// NewGormDB は、SQLiteデータベースへの接続を初期化します。
func NewGormDB() *gorm.DB {
    db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }
    return db
}
