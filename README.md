# todo-api

A NestJS todo API with PostgreSQL, JWT authentication (access + refresh tokens), and per-user todo ownership.

## Requirements

- Node.js 20 or newer
- npm
- Docker (for PostgreSQL)

## 1. Install dependencies

```bash
npm install
```

## 2. Start PostgreSQL

The app expects a PostgreSQL 16 database with the user and database names in `.env`. You can run it with Docker:

```bash
docker run -d --name nest-postgres \
  -e POSTGRES_USER=nestuser \
  -e POSTGRES_PASSWORD=<your-password> \
  -e POSTGRES_DB=todo-db \
  -p 5432:5432 \
  postgres:16
```

If the container already exists, start it with `docker start nest-postgres`.

## 3. Configure environment variables

Create a `.env` file in the project root (it is gitignored):

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nestuser
DB_PASSWORD=<your-password>
DB_DATABASE=todo-db

# Signs both access and refresh tokens. Generate one with:
#   openssl rand -base64 32
JWT_SECRET=<random-secret>
```

## 4. Run database migrations

The schema is managed by migrations (`synchronize` is off):

```bash
npm run typeorm -- migration:run -d src/data-source.ts
```

To roll back the last migration:

```bash
npm run typeorm -- migration:revert -d src/data-source.ts
```

## 5. Start the app

```bash
# development (watch mode)
npm run start:dev

# production build
npm run build
npm run start:prod
```

The API listens on port `3000` by default. Set `PORT` to change it.

- API base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api`

> **Note:** `src/app.module.ts` contains placeholder `ObserveModule` keys (`YOUR_APP_KEY` / `YOUR_APP_SECRET`). Replace them with your own values from https://observe.nestjs.com, or remove the module if you don't use it.

## Authentication

| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| POST | `/api/auth/signup` | public | Create an account. Returns `409` if the email is taken. |
| POST | `/api/auth/login` | public | Returns `{ accessToken }` and sets the `refreshToken` cookie. |
| POST | `/api/auth/refresh` | public (cookie) | Reads the `refreshToken` cookie and returns a new `{ accessToken }`. Also rotates the cookie. |
| POST | `/api/auth/logout` | public | Clears the `refreshToken` cookie. |
| GET | `/api/auth/me` | bearer | Returns the logged-in user. |

- **Access token:** valid for 15 minutes. Send it as `Authorization: Bearer <accessToken>`.
- **Refresh token:** valid for 7 days. It is stored in an httpOnly cookie scoped to `/api/auth`, so JavaScript can't read it.
- Logout only clears the cookie. A refresh token copied before logout stays valid until it expires.

All other routes require a bearer access token.

## Todos

Every todo belongs to the user who created it. Users only see and change their own todos. Another user's todo returns `404`.

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST | `/api/todo` | Create a todo for the current user |
| GET | `/api/todo` | List the current user's todos |
| GET | `/api/todo/:id` | Get one of the current user's todos |
| PATCH | `/api/todo/:id` | Update one of the current user's todos |
| DELETE | `/api/todo/:id` | Delete one of the current user's todos |

Todo body: `{ "title": "Learn NestJS", "status": "open", "starred": false }`

## Testing the API with Swagger

There is no UI yet, so use Swagger to try the endpoints: `http://localhost:3000/api`

1. Call `POST /api/auth/signup` to create an account.
2. Call `POST /api/auth/login` and copy `accessToken` from the response.
3. Use the todo and `/api/auth/me` endpoints with that token.
4. Call `POST /api/auth/refresh` to get a new access token after 15 minutes. It uses the `refreshToken` cookie that login set.
5. Call `POST /api/auth/logout` to clear the cookie.

## Quick try with curl

```bash
# sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"password123"}'

# log in: saves the refresh cookie to cookies.txt and prints the access token
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"password123"}'

# create a todo
curl -X POST http://localhost:3000/api/todo \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"title":"Learn NestJS","status":"open","starred":false}'

# get a new access token using the saved cookie
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh

# log out
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/logout
```

## Tests

```bash
# unit tests
npm run test

# coverage
npm run test:cov
```

`tsc` reports `Cannot find module 'supertest/types'` in `test/app.e2e-spec.ts`, so the end-to-end file needs its `supertest` types added before it type-checks.

## Lint and format

```bash
npm run lint
npm run format
```
