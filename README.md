## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# production mode
$ pnpm run start:prod
```

## ENV
```bash
APP_PORT=""
DATABASE_URL=""
```

## Database Migration
```bash
# Develop
$ pnpx prisma migrate dev || npx prisma migrate dev

# Production
$ pnpx prisma migrate deploy || npx prisma migrate deploy
```
