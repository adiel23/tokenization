#!/bin/bash

# Development startup script for RWA Tokenization Platform
# This script starts both backend and frontend

set -e

echo "🚀 RWA Tokenization Platform - Development Mode"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

# Start backend services
start_backend() {
    echo -e "${BLUE}📦 Starting backend services...${NC}"
    cd ../../infra
    
    # Check if .env.local exists
    if [ ! -f .env.local ]; then
        echo -e "${YELLOW}⚠️  .env.local not found, copying from example...${NC}"
        cp .env.local.example .env.local
    fi
    
    # Start infrastructure services
    docker compose -f docker-compose.local.yml up -d postgres redis bitcoind lnd elementsd
    
    echo -e "${YELLOW}⏳ Waiting for infrastructure to be ready...${NC}"
    sleep 30
    
    # Start application services
    docker compose -f docker-compose.local.yml up -d auth wallet tokenization marketplace education nostr admin gateway
    
    echo -e "${GREEN}✅ Backend services started${NC}"
    echo -e "${BLUE}🌐 Gateway available at: http://localhost:8000${NC}"
}

# Start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend...${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 Installing dependencies...${NC}"
        npm install
    fi
    
    # Create .env.local if not exists
    if [ ! -f .env.local ]; then
        echo -e "${YELLOW}⚠️  .env.local not found, copying from example...${NC}"
        cp .env.local.example .env.local
    fi
    
    echo -e "${GREEN}✅ Frontend starting at: http://localhost:3000${NC}"
    npm run dev
}

# Stop all services
stop_all() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    cd ../../infra
    docker compose -f docker-compose.local.yml down
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Check health
check_health() {
    echo -e "${BLUE}🏥 Checking service health...${NC}"
    
    services=("gateway" "auth" "wallet" "tokenization" "marketplace")
    for service in "${services[@]}"; do
        if curl -s http://localhost:8000/health/$service > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service is healthy${NC}"
        else
            echo -e "${YELLOW}⚠️  $service health check failed${NC}"
        fi
    done
}

# Main
main() {
    case "${1:-all}" in
        backend)
            check_docker
            start_backend
            check_health
            ;;
        frontend)
            start_frontend
            ;;
        stop)
            stop_all
            ;;
        health)
            check_health
            ;;
        all|*)
            check_docker
            start_backend
            check_health
            start_frontend
            ;;
    esac
}

# Trap SIGINT to stop services
trap stop_all SIGINT SIGTERM

main "$@"
