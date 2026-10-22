# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A REST API that accepts JSON query objects via HTTP POST and executes them against a SQL Anywhere database. Built with Koa and TypeScript (uses `tsx` for development). Requires Node >= 20.19; production target is Node 24.

## Commands

- **Dev server:** `npm run dev` (nodemon + tsx, port 3222, watches `src/`)
- **Build:** `npm run build` (runs `tsc`, outputs CommonJS to `dist/`)
- **Start (prod):** `npm start` (runs compiled `dist/api.js`)
- **Type check:** `npx tsc --noEmit` (src only), `npm run typecheck` (src and tests)
- **Tests:** `npm test` (mocha + tsx, `test/**/*.test.ts`, no database needed)

On this Mac the SQL Anywhere client is x86_64-only: run install, tests and the server with `PATH="$HOME/.node-x64/bin:$PATH"`.

## Environment Variables

- `PORT` — server listen port (default in nodemon: 3222)
- `SQLA_CONNECTION` — SQL Anywhere connection string, read by `sistemium-sqlanywhere`
- `REQUIRED_ROLE` — optional auth role enforced via `sistemium-auth` middleware
- `PHA_ROLES_URL` — roles endpoint for `sistemium-auth` (default `https://api.sistemium.com/pha/roles`)
- `DEBUG` — debug namespace filter (default: `stm:*`)

## Architecture

**Entry point:** `src/api.ts` — creates an `AnywhereRest` instance and starts listening if `PORT` is set.

**`src/AnywhereRest.ts`** — Koa app class. Sets up middleware (logger, body parser, optional auth) and routes. Single route: `POST /query`.

**`src/handlers/query.ts`** — Request handler. Accepts a JSON body with SQL parts (`select`, `from`, `where`, `group`, `order`, `having`), builds SQL via `queryToSQL()`, connects to SQL Anywhere (`sistemium-sqlanywhere`), executes, returns results. Supports `parse-only` header to return generated SQL without connecting or executing. `CALL` is explicitly rejected.

**`src/sql.ts`** — `queryToSQL()` converts a structured query object (`QueryObject` interface) into a SQL string. Each clause field can be a string or array (joined with appropriate separators).

**`test/`** — mocha tests. `test/fakeRoles.ts` is loaded first (`.mocharc.json`) and starts a fake roles endpoint for the auth tests.

## Key Libraries

- `sistemium-sqlanywhere` — SQL Anywhere database driver (connect/execImmediate/disconnect); each connection runs in a child process, the native `sqlanywhere` module is built by node-gyp on install
- `sistemium-auth` — token-based auth middleware (optional, enabled when `REQUIRED_ROLE` is set). Pinned to 1.2.6: 1.3.0 changed the `lib/middleware` signature to `middleware(auth, config)`, and the old call gets 401 on every request
- `sistemium-debug` — debug logging with namespace `stm:awr`
- `tsx` — TypeScript execution for development and tests
