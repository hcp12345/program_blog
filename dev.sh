#!/bin/bash

echo "Starting MD Blog development environment..."
echo ""

echo "[1/2] Starting backend server..."
npm run dev &
BACKEND_PID=$!

sleep 3

echo "[2/2] Starting frontend server..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:7001"
echo ""
echo "Press Ctrl+C to stop all services"

# 等待两个进程
wait $BACKEND_PID $FRONTEND_PID
