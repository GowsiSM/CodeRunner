#!/bin/bash
#
# CodeRunner Load Test Runner
#
# This script sets up and runs the load test suite.
# Reports are saved with timestamps for historical comparison.
#
# Usage:
#   ./run_load_test.sh [options]
#
# Options:
#   -n, --students NUM    Number of students to simulate (default: 20)
#   -s, --server URL      Server URL (default: http://localhost:3000)
#   -h, --help           Show this help message
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORTS_DIR="${SCRIPT_DIR}/reports"
VENV_DIR="${SCRIPT_DIR}/.venv"

# Default values
NUM_STUDENTS=20
SERVER_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--students)
            NUM_STUDENTS="$2"
            shift 2
            ;;
        -s|--server)
            SERVER_URL="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -n, --students NUM    Number of students to simulate (default: 20)"
            echo "  -s, --server URL      Server URL (default: http://localhost:3000)"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           CodeRunner Load Test Suite                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Python version
echo -e "${YELLOW}[1/4] Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "       Python version: ${PYTHON_VERSION}"

# Setup virtual environment
echo -e "${YELLOW}[2/4] Setting up virtual environment...${NC}"
if [ ! -d "$VENV_DIR" ]; then
    echo "       Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "${VENV_DIR}/bin/activate"

# Install dependencies
echo -e "${YELLOW}[3/4] Installing dependencies...${NC}"
pip install --quiet --upgrade pip
pip install --quiet 'python-socketio[asyncio_client]' aiohttp

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Check if server is running
echo -e "${YELLOW}[4/4] Checking server connectivity...${NC}"
if curl --silent --fail "${SERVER_URL}/health" > /dev/null 2>&1; then
    echo -e "       ${GREEN}✓ Server is running at ${SERVER_URL}${NC}"
else
    echo -e "       ${YELLOW}⚠ Warning: Cannot reach ${SERVER_URL}/health${NC}"
    echo "       The server may not be running. Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Starting load test...${NC}"
echo "  Students: ${NUM_STUDENTS}"
echo "  Server:   ${SERVER_URL}"
echo "  Reports:  ${REPORTS_DIR}"
echo ""

# Run the test
python3 "${SCRIPT_DIR}/load_test.py" \
    --students "$NUM_STUDENTS" \
    --server "$SERVER_URL" \
    --output "$REPORTS_DIR"

# Deactivate virtual environment
deactivate

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Load test completed successfully!               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Reports saved to: ${REPORTS_DIR}"
echo ""
echo "To re-run the test:"
echo "  ${SCRIPT_DIR}/run_load_test.sh -n ${NUM_STUDENTS} -s ${SERVER_URL}"
