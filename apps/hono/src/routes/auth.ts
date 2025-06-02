import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { signUpSchema, loginSchema } from "../validators/auth.validator";
import { AuthService } from "../services/auth.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import type {
  LoginResponse as LoginResponseType,
  MeResponseType as MeType,
  JwtPayload,
} from "../types/auth.types";

const authRoutes = new OpenAPIHono();
const authService = new AuthService();

// OpenAPI Components - Security Scheme
authRoutes.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT Bearer token for authentication.",
});

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
    message: z.string().openapi({ description: "A human-readable error message." }),
    code: z.number().optional().openapi({ description: "An optional error code." }),
    errors: z
      .any()
      .optional()
      .openapi({ description: "Optional detailed error information, e.g., validation errors." }),
  })
  .openapi({
    description: "Schema for error responses.",
  });

// --- Route Definitions ---

// POST /signup
const signUpRoute = createRoute({
  method: "post",
  path: "/signup",
  summary: "User Sign Up",
  description: "Registers a new user and returns an access token upon successful registration.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: signUpSchema,
        },
      },
      required: true,
      description: "User registration details.",
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
      description: "User created successfully. Returns an access token.",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema.openapi({
            example: { message: "Validation failed", errors: { email: ["Invalid email format"] } },
          }),
        },
      },
      description: "Bad Request (e.g., validation error).",
    },
    409: {
      content: {
        "application/json": {
          schema: ErrorSchema.openapi({
            example: { message: "User with this email already exists" },
          }),
        },
      },
      description: "Conflict (e.g., user already exists).",
    },
  },
  tags: ["Auth"],
});

authRoutes.openapi(signUpRoute, async (c) => {
  const input = c.req.valid("json");
  const response: LoginResponseType = await authService.signUp(input);
  return c.json(response, 201);
});

// POST /login
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  summary: "User Login",
  description: "Logs in an existing user and returns an access token.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
      required: true,
      description: "User login credentials.",
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
      description: "Login successful. Returns an access token.",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema.openapi({
            example: { message: "Invalid input provided" },
          }),
        },
      },
      description: "Bad Request (e.g., validation error).",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema.openapi({
            example: { message: "Invalid email or password" },
          }),
        },
      },
      description: "Unauthorized (e.g., invalid credentials).",
    },
  },
  tags: ["Auth"],
});

authRoutes.openapi(loginRoute, async (c) => {
  const input = c.req.valid("json");
  const response: LoginResponseType = await authService.login(input);
  return c.json(response);
});

// GET /me
const meRoute = createRoute({
  method: "get",
  path: "/me",
  summary: "Get Current User Details",
  description: "Retrieves the details of the currently authenticated user.",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MeResponseSchema,
        },
      },
      description: "Successfully retrieved user details.",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema.openapi({
            example: { message: "Unauthorized. Token is missing or invalid." },
          }),
        },
      },
      description: "Unauthorized (e.g., token missing or invalid).",
    },
  },
  tags: ["Auth"],
});

authRoutes.openapi(meRoute, authMiddleware, async (c) => {
  const userPayload = c.get("user") as JwtPayload;
  const userDetails: MeType = await authService.me(userPayload.sub);
  return c.json(userDetails);
});

// POST /logout
const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "User Logout",
  description: "Logs out the currently authenticated user. The actual mechanism of token invalidation depends on the server-side implementation (e.g., blacklisting JWTs).",
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LogoutSuccessResponseSchema,
        },
      },
      description: "Successfully logged out.",
    },
    // Alternative: 204 No Content if no message body is returned.
    // 204: {
    //   description: "Successfully logged out (No Content).",
    // },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema.openapi({
            example: { message: "Unauthorized. Token is missing or invalid." },
          }),
        },
      },
      description: "Unauthorized.",
    },
  },
  tags: ["Auth"],
});

authRoutes.openapi(logoutRoute, authMiddleware, async (c) => {
  const userPayload = c.get("user") as JwtPayload;
  // Assuming authService.logout performs necessary actions (e.g., token blacklisting if applicable)
  // and might return a status or a simple message.
  // The original code `const response = await authService.logout(...)` implies it might return something.
  // We'll standardize the response here to match LogoutSuccessResponseSchema.
  await authService.logout(userPayload.sub);
  return c.json({ message: "Successfully logged out" });
});

export default authRoutes;
