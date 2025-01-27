package model

type User struct {
    ID       string
    Email    string
    Password string
    Username string
}

type ServerSession struct {
    ID          string
    UserID      string
    Origin      string
    ServerToken string
    ServerType  string
}

type ServerInfo struct {
    ID              string
    ServerSessionID string
    Name            string
    IconUrl         string
    FaviconUrl      string
    ThemeColor      string
}
