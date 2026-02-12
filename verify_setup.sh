#!/bin/bash
echo "Verifying Backend Health..."
curl -s http://localhost:3001/api/v1/health | grep "ok" && echo "Backend is HEALTHY" || echo "Backend is UNHEALTHY"

echo "Verifying Frontend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep "200" && echo "Frontend is REACHABLE" || echo "Frontend is UNREACHABLE"

echo "Attempting Login (Expected Failure as DB is empty)..."
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'
