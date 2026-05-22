#!/usr/bin/env bash
# Forensic Analytics — Stop All Servers for Linux/macOS
# Harare Institute of Technology

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}Stopping Forensic Analytics servers...${NC}"
echo

# Find and kill backend running on port 8000
BACKEND_PID=$(lsof -t -i:8000 2>/dev/null)
if [ ! -z "$BACKEND_PID" ]; then
    echo "Killing backend server (PIDs: $BACKEND_PID)..."
    kill -9 $BACKEND_PID 2>/dev/null
else
    echo "No backend server found running on port 8000."
fi

# Find and kill frontend running on port 3000
FRONTEND_PID=$(lsof -t -i:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "Killing frontend server (PIDs: $FRONTEND_PID)..."
    kill -9 $FRONTEND_PID 2>/dev/null
else
    echo "No frontend server found running on port 3000."
fi

echo
echo -e "${GREEN}Servers stopped successfully.${NC}"
echo
