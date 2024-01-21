## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# production mode
$ pnpm run start:prod

# Using pm2 to run in background and auto restart 
$ pm2 start
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
