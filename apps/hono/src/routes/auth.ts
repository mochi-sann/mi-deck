import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthService } from "../services/auth.service";
import type {
  JwtPayload,
  LoginResponse,
  MeResponseType,
} from "../types/auth.types";
import { loginSchema, signUpSchema } from "../validators/auth.validator";

type Variables = {
  Variables: {
    user: JwtPayload;
  };
};

const authRoutes = new OpenAPIHono<Variables>();
const authService = new AuthService();

// POST /api/v1/auth/signup
authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/signup",
    request: {
      body: {
        content: {
          "application/json": {
            schema: signUpSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User successfully created",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
              },
            },
          },
        },
      },
    },
  }),
  async (c) => {
    const input = c.req.valid("json");
    const response: LoginResponse = await authService.signUp(input);
    return c.json(response, 201);
  },
);

// POST /api/v1/auth/login
authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/login",
    request: {
      body: {
        content: {
          "application/json": {
            schema: loginSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
              },
            },
          },
        },
      },
    },
  }),
  async (c) => {
    const input = c.req.valid("json");
    const response: LoginResponse = await authService.login(input);
    return c.json(response);
  },
);

// GET /api/v1/auth/me
authRoutes.openapi(
  createRoute({
    method: "get",
    path: "/me",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "Get current user details",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      },
    },
  }),
  authMiddleware,
  async (c) => {
    const userPayload = c.get("user") as JwtPayload;
    const userDetails: MeResponseType = await authService.me(userPayload.sub);
    return c.json(userDetails);
  },
);

// POST /api/v1/auth/logout
authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/logout",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "Logout successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  }),
  authMiddleware,
  async (c) => {
    const userPayload = c.get("user") as JwtPayload;
    const response = await authService.logout(userPayload.sub);
    return c.json(response);
  },
);

// Swagger UI
authRoutes.get("/swagger", swaggerUI({ url: "/api/v1/auth/doc" }));

// OpenAPI JSON
authRoutes.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Auth API",
    version: "1.0.0",
    description: "Authentication API endpoints",
  },
} as const);

export default authRoutes;
