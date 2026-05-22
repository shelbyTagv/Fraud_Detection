#!/usr/bin/env bash
# Forensic Analytics — First Time Setup Script for Linux/macOS
# Harare Institute of Technology

set -e # Exit on error

# Colors for premium terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0;32m' # No Color (default green aesthetic)
RESET='\033[0m'

echo -e "${GREEN}============================================================${RESET}"
echo -e "${GREEN} FORENSIC ANALYTICS PROTOTYPE — FIRST TIME SETUP (LINUX/MAC)${RESET}"
echo -e "${GREEN} Harare Institute of Technology${RESET}"
echo -e "${GREEN}============================================================${RESET}"
echo

# ── CHECK PYTHON ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/5] Checking Python installation...${RESET}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: python3 is not installed or not in PATH.${RESET}"
    echo "Please install Python 3.10 or newer."
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}Found: $PYTHON_VERSION${RESET}"

# ── CHECK NODE ────────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/5] Checking Node.js installation...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed or not in PATH.${RESET}"
    echo "Please install Node.js (LTS version)."
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}Found Node.js: $NODE_VERSION${RESET}"

# ── BACKEND SETUP ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/5] Setting up Python backend...${RESET}"
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing backend packages (this may take a couple of minutes)..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo -e "${GREEN}Backend packages installed successfully.${RESET}"

# ── GENERATE SAMPLE DATA ──────────────────────────────────────────────────────
echo -e "${BLUE}[4/5] Generating sample transaction data...${RESET}"
python3 utils/data_generator.py || echo -e "${YELLOW}WARNING: Could not generate sample data. You can do this manually later.${RESET}"

deactivate
cd ..

# ── FRONTEND SETUP ────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/5] Setting up React frontend...${RESET}"
cd frontend
echo "Installing frontend dependencies (this may take a couple of minutes)..."
npm install --silent

echo -e "${GREEN}Frontend packages installed successfully.${RESET}"
cd ..

echo
echo -e "${GREEN}============================================================${RESET}"
echo -e "${GREEN} SETUP COMPLETE!${RESET}"
echo -e "${GREEN}============================================================${RESET}"
echo
echo "You can now run the system using the shell scripts:"
echo "   ./start_backend.sh   (run this first, keep it open/running)"
echo "   ./start_frontend.sh  (run this second)"
echo "   Or use: ./start_all.sh to launch both at once!"
echo
