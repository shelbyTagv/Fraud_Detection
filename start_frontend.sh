#!/usr/bin/env bash
# Forensic Analytics — Start Frontend for Linux/macOS
# Harare Institute of Technology

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  FORENSIC ANALYTICS — FRONTEND${NC}"
echo -e "${GREEN}  Harare Institute of Technology${NC}"
echo -e "${GREEN}============================================================${NC}"
echo
echo "Starting frontend..."
echo "Keep this process running while using the system."
echo

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}ERROR: Frontend not set up yet.${NC}"
    echo "Please run ./setup.sh first."
    exit 1
fi

echo "Make sure the backend is already running (./start_backend.sh) before using the system."
echo
echo -e "${GREEN}Opening http://localhost:3000 ...${NC}"
echo

cd frontend
npm start
