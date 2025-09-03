#!/bin/sh

set -e

: "${TZ:=Asia/Manila}"
export TZ

echo "Starting post-deployment steps..."

# Run migration
echo "Running Prisma migration..."
bun prisma migrate deploy

echo "Starting the application..."
exec bun run "./dist/main"
