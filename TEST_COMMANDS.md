# Test Commands Quick Reference

Quick reference for all testing commands in CodeRunner.

## Quick Start (Recommended)

```bash
./run-tests.sh
```

This runs both server and client tests automatically.

## Server Tests

```bash
cd server
npm test
```

**What it tests:**

- Configuration validation
- Network management
- Container pool lifecycle
- Execution queue concurrency

**Test file:** `server/tests/server.test.ts`  
**Test count:** 73 tests  
**Framework:** Jest + TypeScript

## Client Tests

```bash
cd client
npm run test:run          # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Visual UI
```

**What it tests:**

- WebSocket connections
- Editor store state
- File utilities
- Component rendering

**Framework:** Vitest + React Testing Library

## Load Testing

### Quick Load Test

```bash
cd server/tests/load-test-java
./run-load-test.sh
```

This runs a default load test with 60 users, 30 concurrent.

### Custom Load Test

```bash
cd server/tests/load-test-java

# Build (first time only)
mvn clean package

# Run with custom parameters
java -jar target/load-tester-1.0-jar-with-dependencies.jar \
  --users 100 \
  --ramp-time 30 \
  --duration 60 \
  --concurrent 50
```

### Environment Variable Configuration

```bash
# Override defaults
USERS=100 CONCURRENT=50 ./run-load-test.sh
```

**Parameters:**

- `--users N` - Total users to simulate (default: 60)
- `--ramp-time N` - Ramp-up period in seconds (default: 30)
- `--duration N` - Test duration in seconds (default: 60)
- `--concurrent N` - Max concurrent users (default: 30)
- `--server-url URL` - Server URL (default: http://localhost:3000)

## Individual Test Files

```bash
# Specific server test
cd server && npm test -- server.test.ts

# Specific client test
cd client && npm run test:run -- src/hooks/useSocket.test.ts
```

## Code Coverage

```bash
# Server coverage
cd server && npm test -- --coverage

# Client coverage
cd client && npm run test:run -- --coverage
```

## Watch Mode (Development)

```bash
# Server (auto-rerun on changes)
cd server && npm test -- --watch

# Client (auto-rerun on changes)
cd client && npm run test:watch
```

## Test Prerequisites

### Server Tests

- Node.js 18+
- Docker running (for network tests)

### Load Tests

- Java 11+
- Maven 3.6+
- Running server on http://localhost:3000

### Client Tests

- Node.js 18+
- No other prerequisites

## Continuous Integration

```bash
# GitHub Actions / Jenkins / etc.
npm install                    # Install dependencies
npm test                       # Run server tests
cd ../client && npm install    # Client dependencies
npm run test:run              # Client tests
```

## Documentation

For detailed testing information:

- [Testing Guide](docs/testing.md) - Complete testing documentation
- [Load Test README](server/tests/load-test-java/README.md) - Load testing guide
- [Queue Architecture](docs/queue-architecture.md) - System design

## Quick Troubleshooting

**Server tests fail:**

```bash
# Check Docker is running
docker ps

# Reinstall dependencies
cd server && rm -rf node_modules && npm install
```

**Load test fails:**

```bash
# Verify server is running
curl http://localhost:3000/api/health

# Rebuild load tester
cd server/tests/load-test-java
mvn clean package
```

**Client tests fail:**

```bash
# Clear cache
cd client
rm -rf node_modules/.vite
npm run test:run
```
