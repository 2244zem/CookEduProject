# CookEdu API Contract

Base URL web: `VITE_API_URL` or `/api` in local dev.
Base URL Android: stored server URL, normalized without trailing `/api`.

All authenticated calls use:

```http
Authorization: Bearer <token>
Accept: application/json
```

## Auth

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `POST` | `/api/register` | `name`, `email`, `password`, `password_confirmation`, optional `phone` | `{ message, user, token }` |
| `POST` | `/api/login` | `email`, `password` | `{ message, user, token }` |
| `POST` | `/api/logout` | none | `{ message }` |

## Profile

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/profile` | none | `{ user }` |
| `PUT` | `/api/profile` | JSON or multipart `name`, `phone`, `avatar` | `{ message, user }` |
| `POST` | `/api/profile` | multipart with `_method=PUT` | `{ message, user }` |
| `POST` | `/api/profile/avatar` | multipart `avatar` | `{ message, user }` |

Avatar upload rules: `jpeg`, `png`, `jpg`, or `gif`, max `2048 KB`.
Use `user.avatar_url` as the canonical display URL on web and Android.

## Recipes

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/api/recipes` | public list |
| `GET` | `/api/recipes/{id}` | public detail |
| `GET` | `/api/categories` | public categories |
| `POST` | `/api/admin/recipes` | admin, multipart supported |
| `PUT` | `/api/admin/recipes/{id}` | admin |
| `DELETE` | `/api/admin/recipes/{id}` | admin |

## Learning

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/api/lessons` | public list |
| `GET` | `/api/lessons/{id}` | auth detail |
| `POST` | `/api/lessons/{id}/quiz` | auth quiz submit |
| `GET` | `/api/learning/progress` | auth progress |

## Chef AI

| Method | Endpoint | Body |
| --- | --- | --- |
| `POST` | `/api/chef-ai` | `prompt`, optional `history` |
| `POST` | `/api/chef-ai/recommend` | `ingredients` |
| `GET` | `/api/chef-ai/tips/{recipe}` | none |

## Deployment Notes

For Cloudflare Pages, build from `frontend`:

```bash
npm run build
```

Publish directory:

```text
frontend/dist
```

The static fallback is `/* /index.html 200`; HTML and service worker files are no-store/no-cache, while hashed assets are immutable.
