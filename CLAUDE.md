# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo using pnpm workspaces with Turbo for build orchestration. The project consists of:

- **Frontend** (`apps/front`): React application using Vite, TanStack Router, TanStack Query, and Tailwind CSS
- **Server** (`apps/server`): NestJS API server with Prisma ORM and PostgreSQL

## Commands

### Development Commands
- `pnpm dev` - Starts both frontend and server in development mode
- `pnpm build` - Builds both applications
- `pnpm test` - Runs tests for both applications
- `pnpm lint` - Lints both applications
- `pnpm format` - Formats code using Biome
- `pnpm check` - Runs Biome checks and fixes

### Frontend-specific Commands
Use `pnpm run front -- <command>` for frontend-specific tasks:
- `pnpm run front -- dev` - Start frontend development server
- `pnpm run front -- test` - Run frontend tests
- `pnpm run front -- test:coverage` - Run tests with coverage
- `pnpm run front -- test -- <target>` - Run specific test file
- `pnpm run front -- storybook` - Start Storybook
- `pnpm run front -- typecheck` - Run TypeScript type checking

### Server-specific Commands
Use `pnpm run server -- <command>` for server-specific tasks:
- `pnpm run server -- dev` - Start server in development mode
- `pnpm run server -- test` - Run server tests
- `pnpm run server -- test:e2e` - Run e2e tests
- `pnpm run server -- db:migrate:dev` - Run database migrations
- `pnpm run server -- db:seed` - Seed database with development data
- `pnpm run server -- db:studio` - Open Prisma Studio

### E2E Testing
- `pnpm run test:e2e:server` - Run server e2e tests

## Package Manager

**IMPORTANT**: Always use `pnpm` commands (e.g., `pnpm install`, `pnpm test`). Never use npm or yarn.

## Authentication

- Default login email: `example2@example.com`
- Default password: `password`

## Database

- Uses PostgreSQL with Prisma ORM
- Prisma schema location: `apps/server/prisma/schema.prisma`
- Generated Prisma client: `apps/server/src/generated/prisma`

## API Integration

- Frontend uses openapi-fetch and openapi-react-query for API calls
- API types are auto-generated from server's Swagger spec
- Frontend directly connects to Misskey instances using misskey-js library

## Architecture Notes

### Frontend Architecture
- **Router**: TanStack Router with file-based routing in `apps/front/src/routes/`
- **State Management**: TanStack Query for server state, React Context for client state
- **Authentication**: JWT-based auth with protected routes using `_authed` layout
- **UI Components**: Park UI (Radix UI + Tailwind CSS) in `apps/front/src/Component/ui/`
- **Testing**: Vitest with React Testing Library, MSW for API mocking

### Server Architecture
- **Framework**: NestJS with modular structure
- **Database**: Prisma ORM with PostgreSQL
- **Auth**: JWT-based authentication
- **API Documentation**: Swagger/OpenAPI with Scalar UI
- **Main Modules**:
  - `auth` - Authentication and authorization
  - `user` - User management
  - `server-sessions` - Misskey server connection management
  - `timeline` - Timeline management

## Git Conventions

- Commit messages should be in Japanese
- Follow conventional commit patterns when possible

## Local Development Setup

The project includes Docker Compose setup for local Misskey instance:
- Local Misskey URL: `http://localhost:3002`
- Test user: `@hoge` with password `hoge`
- Add to hosts file: `127.0.0.1 local-misskey.local`

## Testing Guidelines

- Aim for high test coverage
- Frontend tests use Vitest + React Testing Library
- Server tests use Vitest + Supertest
- Use MSW for mocking network requests
- Test files should be co-located with source files using `.test.ts` or `.test.tsx` extension