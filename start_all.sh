#!/usr/bin/env bash
# Forensic Analytics — Start All Servers for Linux/macOS
# Harare Institute of Technology

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  FORENSIC ANALYTICS PROTOTYPE — STARTING SYSTEM${NC}"
echo -e "${GREEN}  Harare Institute of Technology${NC}"
echo -e "${GREEN}============================================================${NC}"
echo

# Check setup
if [ ! -d "backend/venv" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}ERROR: System not fully set up yet.${NC}"
    echo "Please run ./setup.sh first."
    exit 1
fi

# Function to handle shutdown of background processes
cleanup() {
    echo
    echo -e "${RED}Stopping all servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    exit 0
}

# Trap Ctrl+C (SIGINT) and SIGTERM to clean up background processes
trap cleanup INT TERM

echo -e "${BLUE}Starting backend server in the background...${NC}"
cd backend
source venv/bin/activate
# Run uvicorn in the background, redirecting output slightly to avoid cluttering but still letting it print
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo -e "${BLUE}Waiting 3 seconds for backend to initialize...${NC}"
sleep 3

echo -e "${BLUE}Starting frontend in the foreground...${NC}"
echo -e "${GREEN}Both servers are now running.${NC}"
echo -e "${GREEN}  Backend API:  http://localhost:8000${NC}"
echo -e "${GREEN}  Frontend UI:  http://localhost:3000${NC}"
echo
echo -e "${GREEN}Press Ctrl+C in this terminal to stop both servers at any time.${NC}"
echo -e "${GREEN}============================================================${NC}"
echo

cd frontend
npm start
