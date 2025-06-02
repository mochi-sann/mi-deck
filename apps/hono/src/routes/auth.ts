import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AuthService } from "../services/auth.service";
import type {
  JwtPayload,
  LoginResponse,
  MeResponseType,
} from "../types/auth.types";
import { loginSchema, signUpSchema } from "../validators/auth.validator";

const authRoutes = new Hono();
const authService = new AuthService();

// OpenAPI Components - Security Scheme
// --- Schemas for OpenAPI responses ---

const LoginResponseSchema = z
  .object({
    accessToken: z.string(),
  })
  .openapi({
    description: "Contains the access token for the authenticated user.",
    example: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  });

const MeResponseSchema = z
  .object({
    id: z.string().openapi({ description: "User ID" }),
    email: z.string().email().openapi({ description: "User's email address" }),
    name: z
      .string()
      .nullable()
      .optional()
      .openapi({ description: "User's name (optional)" }),
  })
  .openapi({
    description: "Details of the authenticated user.",
    example: {
      id: "clxko2b010000abcdef12345",
      email: "user@example.com",
      name: "John Doe",
    },
  });

const LogoutSuccessResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi({
    description: "Success message upon logging out.",
    example: {
      message: "Successfully logged out",
    },
  });

const ErrorSchema = z
  .object({
    message: z
      .string()
      .openapi({ description: "A human-readable error message." }),
    code: z
      .number()
      .optional()
      .openapi({ description: "An optional error code." }),
    errors: z.any().optional().openapi({
      description:
        "Optional detailed error information, e.g., validation errors.",
    }),
  })
  .openapi({
    description: "Schema for error responses.",
  });

// --- Route Definitions ---

// POST /api/v1/auth/signup
authRoutes.post(
  "/signup",
  describeRoute({
    description: "Registers a new user and returns an access token.",
    responses: {
      201: {
        description: "User created",
        content: { "text/json": { schema: resolver(signUpSchema) } },
      },
      400: {
        content: {
          "application/json": {
            schema: resolver(
              ErrorSchema.openapi({
                example: {
                  message: "unmached input",
                },
              }),
            ),
          },
        },
        description: "Unauthorized.",
      },

      401: {
        content: {
          "application/json": {
            schema: resolver(
              ErrorSchema.openapi({
                example: {
                  message: "Unauthorized. Token is missing or invalid.",
                },
              }),
            ),
          },
        },
        description: "Unauthorized.",
      },
    },
  }),
  zValidator("json", signUpSchema),
  async (c) => {
    const input = c.req.valid("json");
    // NestJSのAuthControllerのsignUpはLoginEntity (accessTokenを持つ) を返しているので合わせる
    const response: LoginResponse = await authService.signUp(input);
    return c.json(response, 201); // 201 Created
  },
);

// POST /api/v1/auth/login
authRoutes.post(
  "/login",
  describeRoute({
    description: "Contains the access token for the authenticated user.",
    responses: {
      200: {
        description: "Contains the access token for the authenticated user.",

        content: {
          "text/json": {
            schema: resolver(LoginResponseSchema),
          },
        },
      },
      401: {
        content: {
          "application/json": {
            schema: resolver(
              ErrorSchema.openapi({
                example: {
                  message: "Unauthorized. Token is missing or invalid.",
                },
              }),
            ),
          },
        },
        description: "Unauthorized.",
      },
    },
  }),
  zValidator("json", loginSchema),
  async (c) => {
    const input = c.req.valid("json");
    const response: LoginResponse = await authService.login(input);
    return c.json(response); // 200 OK (default)
  },
);

// GET /api/v1/auth/me
authRoutes.get(
  "/me",
  describeRoute({
    description: "Details of the authenticated user.",
    responses: {
      200: {
        description: "Details of the authenticated user.",

        content: {
          "text/json": {
            schema: resolver(MeResponseSchema),
          },
        },
      },
    },
  }),
  authMiddleware,
  async (c) => {
    const userPayload = c.get("user") as JwtPayload;
    // userPayload.sub (userId) は authMiddleware で検証済みのはず
    const userDetails: MeResponseType = await authService.me(userPayload.sub);
    return c.json(userDetails);
  },
);

// POST /api/v1/auth/logout
authRoutes.post(
  "/logout",
  describeRoute({
    description: "Details of the authenticated user.",
    responses: {
      200: {
        description: "Details of the authenticated user.",

        content: {
          "text/json": {
            schema: resolver(LogoutSuccessResponseSchema),
          },
        },
      },
    },
  }),
  authMiddleware, // ログアウトも認証が必要な操作とする (NestJSのAuthGuardはかかっていないが、user特定のため)
  async (c) => {
    const userPayload = c.get("user") as JwtPayload;
    const response = await authService.logout(userPayload.sub); // ユーザーIDを渡す
    return c.json(response);
  },
);

export default authRoutes;
