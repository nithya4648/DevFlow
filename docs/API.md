# DevFlow REST API Specification

DevFlow provides a unified REST API for developer productivity, notes, documentation wikis, code snippets, project tracking, and encrypted secret management.

---

## Base URL & Architecture

- **Local Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT stored in HTTP-only cookie (`devflow_token`) or passed via `Authorization: Bearer <token>`
- **Response Format**: `application/json`
- **Security**: AES-256-GCM encrypted secret storage, strict Zod schema validation, ReDoS-protected regex querying, Helmet security headers, rate limiting.

---

## Standard Response & Error Format

All responses follow a consistent envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human readable error summary",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

---

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue session cookie | Public |
| `POST` | `/api/auth/logout` | Clear auth cookie and end session | Private |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `GET` | `/api/auth/verify-email/:token` | Verify user email address | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset email | Public |
| `PUT` | `/api/auth/reset-password/:token` | Reset password using one-time token | Public |
| `PUT` | `/api/auth/profile` | Update display name and avatar URL | Private |
| `PUT` | `/api/auth/change-password` | Update current password | Private |

---

## Documents Wiki (`/api/docs`)

Full markdown documentation management with automated version history.

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/docs` | `search`, `category`, `page`, `limit` | List user documents (paginated) |
| `POST` | `/api/docs` | — | Create document (`title`, `content`, `category`) |
| `GET` | `/api/docs/:id` | — | Fetch single document by ID |
| `PUT` | `/api/docs/:id` | — | Update document (auto-creates version snapshot) |
| `DELETE` | `/api/docs/:id` | — | Delete document and version history |
| `GET` | `/api/docs/:id/versions` | — | Get version snapshot history |
| `GET` | `/api/docs/:id/versions/:versionId` | — | Get content of specific historical version |

---

## Project Tracker (`/api/projects`)

Kanban and calendar project task management.

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/projects` | `status`, `priority`, `label`, `search`, `page`, `limit` | List projects (paginated) |
| `POST` | `/api/projects` | — | Create project (`title`, `description`, `status`, `priority`, `deadline`, `labels`) |
| `GET` | `/api/projects/:id` | — | Get project details |
| `PUT` | `/api/projects/:id` | — | Update project details / status |
| `DELETE` | `/api/projects/:id` | — | Delete project |

---

## Code Snippets (`/api/snippets`)

Multi-language code snippet manager with Monaco editor compatibility.

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/snippets` | `language`, `folder`, `tag`, `favorite`, `search`, `page`, `limit` | List snippets (paginated) |
| `POST` | `/api/snippets` | — | Create snippet (`title`, `code`, `language`, `description`, `folder`, `tags`, `isFavorite`) |
| `GET` | `/api/snippets/:id` | — | Get snippet details |
| `PUT` | `/api/snippets/:id` | — | Update snippet |
| `DELETE` | `/api/snippets/:id` | — | Delete snippet |

---

## Quick Notes (`/api/notes`)

Scratchpad and organized note taking.

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/notes` | `folder`, `search`, `page`, `limit` | List notes (paginated) |
| `POST` | `/api/notes` | — | Create note (`title`, `content`, `folder`) |
| `PUT` | `/api/notes/:id` | — | Update note |
| `DELETE` | `/api/notes/:id` | — | Delete note |

---

## Developer Bookmarks (`/api/bookmarks`)

Curated bookmarks and reference links.

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/bookmarks` | `category`, `search`, `page`, `limit` | List bookmarks (paginated) |
| `POST` | `/api/bookmarks` | — | Create bookmark (`title`, `url`, `category`, `notes`) |
| `PUT` | `/api/bookmarks/:id` | — | Update bookmark |
| `DELETE` | `/api/bookmarks/:id` | — | Delete bookmark |

---

## Encrypted Vault (`/api/env` & `/api/apivault`)

Zero-leakage secret storage using authenticated AES-256-GCM encryption with unique per-record initialization vectors.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/env` | List and decrypt environment variable sets |
| `POST` | `/api/env` | Store encrypted environment variables |
| `PUT` | `/api/env/:id` | Update encrypted environment variable set |
| `DELETE` | `/api/env/:id` | Delete environment variable set |
| `GET` | `/api/apivault` | List encrypted API vault entries |
| `POST` | `/api/apivault` | Create encrypted API key entry |
| `DELETE` | `/api/apivault/:id` | Delete API vault entry |

---

## Global Search (`/api/search`)

Unified cross-resource instant search.

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/search` | `q` (min 2 chars), `type` (`all`, `projects`, `snippets`, `docs`, `notes`, `bookmarks`) | Search all user workspace assets |

---

## Analytics & Activity (`/api/analytics`)

Productivity insights and activity timeline.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/overview` | Aggregated dashboard productivity stats |
| `GET` | `/api/analytics/my-activity` | Personal activity feed timeline |
| `GET` | `/api/analytics/contributions` | Daily contribution heatmap data |
| `POST` | `/api/analytics/tool-usage` | Track feature usage metric |
