package auth

// ErrorResponse represents error response structure
type ErrorResponse struct {
	Error string `json:"error" example:"error message"`
}

// LoginEntity represents login response structure
type LoginEntity struct {
	AccessToken string `json:"accessToken" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

// MeEntity represents user profile response structure
type MeEntity struct {
	ID    string `json:"id"    example:"550e8400-e29b-41d4-a716-446655440000"`
	Email string `json:"email" example:"user@example.com"`
	Name  string `json:"name"  example:"John Doe"`
}
