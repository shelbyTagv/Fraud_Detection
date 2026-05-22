#!/usr/bin/env bash
# Forensic Analytics — Start Backend Server for Linux/macOS
# Harare Institute of Technology

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  FORENSIC ANALYTICS — BACKEND SERVER${NC}"
echo -e "${GREEN}  Harare Institute of Technology${NC}"
echo -e "${GREEN}============================================================${NC}"
echo
echo "Starting backend API server..."
echo "Keep this process running while using the system."
echo

if [ ! -d "backend/venv" ]; then
    echo -e "${RED}ERROR: Backend not set up yet.${NC}"
    echo "Please run ./setup.sh first."
    exit 1
fi

cd backend
source venv/bin/activate

echo -e "${GREEN}Backend starting on http://localhost:8000${NC}"
echo -e "${GREEN}API documentation at http://localhost:8000/docs${NC}"
echo

# Run on 0.0.0.0 to support access from any network interface (WSL, Docker, Localhost)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
