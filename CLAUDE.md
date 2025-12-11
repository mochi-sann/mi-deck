# CLAUDE.md

# t-wada の TDD に従う

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo using pnpm workspaces with Turbo for build orchestration. The project consists of:

- **Frontend** (`apps/front`): React application using Vite, TanStack Router, TanStack Query, and Tailwind CSS

**Note**: The server (`apps/server`) has been removed as of the `remove-server` branch. The application now operates as a client-only architecture that directly connects to Misskey instances.

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

### Server-specific Commands (Legacy - Server Removed)

These commands were available when the server existed:

- `pnpm run server -- dev` - Start server in development mode
- `pnpm run server -- test` - Run server tests
- `pnpm run server -- test:e2e` - Run e2e tests
- `pnpm run server -- db:migrate:dev` - Run database migrations
- `pnpm run server -- db:seed` - Seed database with development data
- `pnpm run server -- db:studio` - Open Prisma Studio

### E2E Testing

- `pnpm run test:e2e:server` - Run server e2e tests (legacy, server removed)
- `npx playwright test` - Run Playwright E2E tests for frontend

## Package Manager

**IMPORTANT**: Always use `pnpm` commands (e.g., `pnpm install`, `pnpm test`). Never use npm or yarn.

## Code Quality Tools

- **Linter/Formatter**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Lefthook for pre-commit hooks
- **TypeScript**: Strict type checking enabled
- **Build Tool**: Vite for fast development and building

## Authentication

- Default login email: `example2@example.com`
- Default password: `password`

## Database (Legacy - Server Removed)

Previously used PostgreSQL with Prisma ORM:

- Prisma schema was located at: `apps/server/prisma/schema.prisma`
- Generated Prisma client was at: `apps/server/src/generated/prisma`

**Current**: The application now uses client-side storage and directly connects to Misskey instances.

## API Integration

- **Current**: Frontend directly connects to Misskey instances using misskey-js library
- **Client Storage**: Uses IndexedDB/localStorage for client-side data persistence
- **Legacy**: Previously used openapi-fetch and openapi-react-query for internal API calls

## Architecture Notes

### Frontend Architecture

- **Router**: TanStack Router with file-based routing in `apps/front/src/routes/`
- **State Management**: TanStack Query for server state, React Context for client state
- **Storage**: Custom storage system using IndexedDB/localStorage (`apps/front/src/lib/storage/`)
- **Authentication**: Misskey-based auth with protected routes using `_authed` layout
- **UI Components**: Park UI (Radix UI + Tailwind CSS) in `apps/front/src/Component/ui/`
- **Testing**: Vitest with React Testing Library, MSW for API mocking
- **Styling**: Tailwind CSS with Park UI (Panda CSS) design system

### Client-Side Architecture

- **Misskey Integration**: Direct connection to Misskey instances via misskey-js
- **Data Persistence**: Local storage management with error boundaries
- **Timeline Management**: Client-side timeline configuration and caching
- **Error Handling**: Comprehensive error boundaries for storage and network failures

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
- Use MSW for mocking network requests
- Test files should be co-located with source files using `.test.ts` or `.test.tsx` extension
- E2E tests use Playwright with configuration in `playwright.config.ts`
- Storybook available for component testing and documentation

## 開発日誌を作成すること

`memo/dev_diary/yyyy-mm-dd_hhmm.md`の形式で開発日誌を作成してください。内容は以下の通りです。

- ** 日付 **: yyyy-mm-dd hh:mm
- ** 作業内容 **:
  ·何をしたか
- どのような問題が発生したか
  どのように解決したか
  ** 次回の予定 **:

- ** 感想 **: 開発の進捗や学び -** 気分 **: なんかいい感じのことを書く
  ** 愚痴 **: なんかいい感じのことを書く
