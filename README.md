# Mi-Deck

![License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)

**Mi-Deck** is a modern, feature-rich web client for [Misskey](https://misskey-hub.net/), built with the latest frontend technologies to provide a fast and accessible user experience.

## ✨ Key Features

- **Modern Architecture**: Built on React 19, Vite 7, and TypeScript for high performance and type safety.
- **Advanced Routing & Data**: Leveraging **TanStack Router** and **TanStack Query** for seamless navigation and efficient server state management.
- **State Management**: Using **Jotai** for flexible and atomic client-state management.
- **Beautiful UI**: Styled with **Tailwind CSS v4** and **Radix UI** primitives for accessible, high-quality components.
- **MFM Support**: Dedicated support for **Misskey Flavored Markdown (MFM)** via the custom `@mi-deck/react-mfm` package.
- **Robust Testing**: Comprehensive testing strategy using **Vitest**, **Playwright**, and **Testing Library**.
- **Developer Experience**: Component isolation with **Storybook** and fast tooling with **Oxlint** and **Biome**.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **State Management**: [Jotai](https://jotai.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Valibot](https://valibot.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [MSW](https://mswjs.io/)
- **Monorepo**: [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)

## 📂 Project Structure

This project is organized as a monorepo:

- **`apps/front`**: The main web application client.
- **`packages/react-mfm`**: A reusable library for rendering mfm.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: >= 25
- **pnpm**: >= 10

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mochi-sann/mi-deck.git
cd mi-deck
pnpm install
```

### Development

To start the development server for the frontend and other packages:

```bash
pnpm dev
```

This will typically launch the app at `http://localhost:5173` (check the terminal output for the exact port).

### Building

To build the application and packages for production:

```bash
pnpm build
```

## 🧪 Testing & Quality

We maintain high code quality standards through testing and linting.

- **Run all tests**:
  ```bash
  pnpm test
  ```
- **Lint & Check types**:
  ```bash
  pnpm check
  ```
- **Format code**:
  ```bash
  pnpm format
  ```

## 🤝 Contributing

Contributions are welcome! Please ensure you follow the existing code style and conventions.

## 📄 License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

# development guide

## dump and restore misskey db file

```bash
# dump misskey sql
docker exec mi-deck-misskey-db-1 pg_dumpall -c -U example-misskey-user  > db_dump/dump.sql
docker compose exec misskey-db pg_dumpall -c -U example-misskey-user  > db_dump/dump.sql

#  restore misskey db

docker volume rm  mi-deck_misskey-db-1
docker-compose up -d misskey-db
cat db_dump/dump.sql | docker-compose exec --no-TTY misskey-db psql misskey example-misskey-user
```

# misskey local info

```
url: http://localhost:3002
user: @hoge
pass: hoge
```
