package models

type CreateServerRequest struct {
    Origin      string `json:"origin" validate:"required,url"`
    SessionToken string `json:"sessionToken" validate:"required,uuid"`
    ServerType  string `json:"serverType" validate:"required,oneof=Misskey OtherServer"`
}

type ServerSessionResponse struct {
    ID         string `json:"id"`
    UserID     string `json:"userId"` 
    Origin     string `json:"origin"`
    ServerToken string `json:"serverToken"`
    ServerType string `json:"serverType"`
    CreatedAt  string `json:"createdAt"`
    UpdatedAt  string `json:"updatedAt"`
}
