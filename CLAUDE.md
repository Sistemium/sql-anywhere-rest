# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A REST API that accepts JSON query objects via HTTP POST and executes them against a SQL Anywhere database. Built with Koa and TypeScript (uses `tsx` for development).

## Commands

- **Dev server:** `npm run dev` (nodemon + tsx, port 3222, watches `src/`)
- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Start (prod):** `npm start` (runs compiled `dist/api.js`)
- **Type check:** `npx tsc --noEmit`

## Environment Variables

- `PORT` — server listen port (default in nodemon: 3222)
- `REQUIRED_ROLE` — optional auth role enforced via `sistemium-auth` middleware
- `DEBUG` — debug namespace filter (default: `stm:*`)

## Architecture

**Entry point:** `src/api.ts` — creates an `AnywhereRest` instance and starts listening if `PORT` is set.

**`src/AnywhereRest.ts`** — Koa app class. Sets up middleware (logger, body parser, optional auth) and routes. Single route: `POST /query`.

**`src/handlers/query.ts`** — Request handler. Accepts a JSON body with SQL parts (`select`, `from`, `where`, `group`, `order`, `having`), builds SQL via `queryToSQL()`, connects to SQL Anywhere (`sistemium-sqlanywhere`), executes, returns results. Supports `parse-only` header to return generated SQL without executing. `CALL` is explicitly rejected.

**`src/sql.ts`** — `queryToSQL()` converts a structured query object (`QueryObject` interface) into a SQL string. Each clause field can be a string or array (joined with appropriate separators).

**`src/types/`** — Ambient type declarations for `sistemium-debug` and `sistemium-auth` (which don't ship their own types).

## Key Libraries

- `sistemium-sqlanywhere` — SQL Anywhere database driver (connect/execImmediate/disconnect)
- `sistemium-auth` — token-based auth middleware (optional, enabled when `REQUIRED_ROLE` is set)
- `sistemium-debug` — debug logging with namespace `stm:awr`
- `tsx` — TypeScript execution for development (replaces `esm`)
