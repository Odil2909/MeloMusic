# Neon PostgreSQL и Prisma в Vercel

Выберите Node.js `20.19+`, `22.12+` или `24+` в настройках проекта. Prisma ORM 7 не поддерживает Node 22.11.

## Переменные окружения

В Vercel откройте проект → **Settings → Environment Variables** и добавьте переменные для нужных сред (Production, Preview и Development):

| Переменная | Значение Neon | Использование |
| --- | --- | --- |
| `DATABASE_URL` | Pooled connection string (хост Neon содержит `-pooler`) | Запросы Prisma Client во время работы приложения |
| `DATABASE_URL_UNPOOLED` | Direct/unpooled connection string (хост без `-pooler`) | Prisma CLI: миграции и проверка статуса |

Скопируйте обе строки в Neon Console для одной и той же ветки базы. Для Production используйте ветку, предназначенную для production; для Preview и Development предпочтительно задать отдельные Neon branches. Не добавляйте кавычки, не коммитьте значения и не вставляйте их в исходники.

Текущая авторизация также требует `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL` и `NEON_AUTH_COOKIE_SECRET`. Установите для них значения соответствующей Neon Auth ветки; создайте отдельный случайный cookie secret не короче 32 символов для каждой среды.

## Применение миграций

Prisma Client генерируется при установке зависимостей. Схему применяйте отдельно перед релизом приложения, с `DATABASE_URL_UNPOOLED`, направленным на целевую Neon branch:

```sh
npm run db:migrate:deploy
```

Не запускайте миграции из каждого serverless-запроса. Чтобы проверить, какие миграции применены:

```sh
npm run db:migrate:status
```

После изменения Vercel environment variables запустите новый deployment. Production, Preview и Development должны получать значения своей ветки базы; не направляйте preview-deployment в production branch без явной причины.

Локально `prisma.config.ts` загружает `.env.local`, используемый Next.js. В Vercel Prisma CLI читает переменные из окружения deployment/CI; не полагайтесь на наличие `.env.local` в production.
