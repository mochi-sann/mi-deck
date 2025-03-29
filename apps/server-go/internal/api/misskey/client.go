package misskey

import (
	"context"
	"net/http"

	"github.com/oapi-codegen/runtime/client"
)

type Client struct {
	ServerURL string
	Client    *http.Client
}

func NewClient(serverURL string) *Client {
	return &Client{
		ServerURL: serverURL,
		Client:    http.DefaultClient,
	}
}

func (c *Client) WithHTTPClient(client *http.Client) *Client {
	c.Client = client
	return c
}

// Generated client methods will be added here after generation
