
This project uses pnpm as the package manager in a monorepo setup.
Always use pnpm commands (e.g., `pnpm install`, `pnpm test`). Do not use npm or yarn.

The root `package.json` defines shortcut scripts to target specific workspaces:

When running commands specific to the **server-side** application (`@mi-deck/server` located in `apps/server`):
Use the root script `pnpm run server -- <command>`.
Example: To run tests for the server, use `pnpm run server -- test`.
Example: To build the server, use `pnpm run server -- build`.
Example: To run e2e tests for the server, use `pnpm run test:e2e:server`.

When running commands specific to the **front-end** application (`@mi-deck/front` located in `apps/front`):
Use the root script `pnpm run front -- <command>`.
Example: To start the dev server for the front-end, use `pnpm run front -- dev`.
Example: To lint the front-end, use `pnpm run front -- lint`.

Note the use of `--` after `pnpm run server` or `pnpm run front` to pass the subsequent arguments correctly to the underlying pnpm command within the script.


if you see login page type in login email is `example2@example.com` password is `password`
