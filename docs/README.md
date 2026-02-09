# Documentation Index

Complete documentation for the CodeRunner project.

## Quick Links

| Document                                    | Description                    |
| ------------------------------------------- | ------------------------------ |
| [README](../README.md)                      | Project overview and setup     |
| [TEST_COMMANDS](../TEST_COMMANDS.md)        | Quick test command reference   |
| [Getting Started](getting-started.md)       | Detailed setup guide           |
| [Testing Guide](testing.md)                 | Complete testing documentation |
| [Queue Architecture](queue-architecture.md) | Execution queue system design  |
| [Contributing](contributing.md)             | Contribution guidelines        |

## Getting Started

Start here if you're new to the project:

1. **[README](../README.md)** - Project overview, features, quick start
2. **[Getting Started Guide](getting-started.md)** - Detailed installation instructions
3. **[TEST_COMMANDS](../TEST_COMMANDS.md)** - Quick reference for running tests

## Testing

Everything about testing the application:

- **[Testing Guide](testing.md)** - Comprehensive testing documentation
  - Unit & integration tests
  - Load testing procedures
  - Test configuration
  - Troubleshooting
  - Performance benchmarks

- **[Load Test README](../server/tests/load-test-java/README.md)** - Java load tester documentation
  - Installation and build
  - Command-line usage
  - Test scenarios
  - Results interpretation
  - Advanced configuration

- **[TEST_COMMANDS](../TEST_COMMANDS.md)** - Quick command reference
  - All test commands
  - Common workflows
  - Troubleshooting quick fixes

## Architecture

System design and implementation details:

- **[Queue Architecture](queue-architecture.md)** - Execution queue system
  - Priority-based scheduling
  - Concurrent execution management
  - Non-blocking architecture
  - Monitoring and metrics
  - Performance characteristics
  - Best practices

## Development

Contributing to the project:

- **[Contributing Guide](contributing.md)** - How to contribute
  - Code style
  - Git workflow
  - Pull request process
  - Testing requirements

## Project Structure

```
CodeRunner/
├── README.md                      # Project overview
├── TEST_COMMANDS.md               # Quick test reference
├── run-tests.sh                   # Run all tests
├── setup.sh                       # Setup script
├── cleanup.sh                     # Cleanup script
│
├── docs/                          # Documentation
│   ├── README.md                  # This file
│   ├── getting-started.md         # Setup guide
│   ├── testing.md                 # Testing guide
│   ├── queue-architecture.md      # Queue system docs
│   └── contributing.md            # Contribution guide
│
├── server/                        # Backend
│   ├── src/
│   │   ├── index.ts              # Main server & queue
│   │   ├── config.ts             # Configuration
│   │   ├── pool.ts               # Container pool
│   │   └── networkManager.ts     # Network management
│   ├── tests/
│   │   ├── server.test.ts        # Unit tests
│   │   └── load-test-java/       # Load testing
│   │       ├── README.md         # Load test docs
│   │       └── run-load-test.sh  # Load test runner
│   └── package.json
│
├── client/                        # Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom hooks
│   │   ├── stores/               # State management
│   │   └── lib/                  # Utilities
│   └── package.json
│
└── runtimes/                      # Docker images
    ├── python/
    ├── javascript/
    ├── java/
    ├── cpp/
    └── mysql/
```

## Common Tasks

### Running Tests

```bash
# All tests
./run-tests.sh

# Server only
cd server && npm test

# Client only
cd client && npm run test:run

# Load test
cd server/tests/load-test-java && ./run-load-test.sh
```

See [Testing Guide](testing.md) for comprehensive testing documentation.

### Monitoring the System

```bash
# Queue statistics
curl http://localhost:3000/api/queue-stats

# Container pool metrics
curl http://localhost:3000/api/pool-stats

# Network statistics
curl http://localhost:3000/api/network-stats
```

See [Queue Architecture](queue-architecture.md) for monitoring details.

### Configuration

All configuration is in `server/src/config.ts` with environment variable overrides:

```bash
# Key settings
MAX_CONCURRENT_SESSIONS=50    # Concurrent execution limit
MAX_QUEUE_SIZE=200            # Queue capacity
QUEUE_TIMEOUT=60000           # Task timeout (ms)
SESSION_TTL=30000             # Container TTL (ms)
DOCKER_MEMORY=128m            # Memory per container
DOCKER_CPUS=0.5              # CPU per container
```

## Getting Help

1. **Check documentation** - Most questions are answered here
2. **Review test output** - Tests provide detailed error messages
3. **Check logs** - Server logs show execution details
4. **Monitoring endpoints** - Real-time system statistics

## Documentation Conventions

Throughout the documentation:

- 📖 = Link to detailed documentation
- ✅ = Recommended approach
- ⚠️ = Warning or important note
- 💡 = Tip or helpful information
- 🐛 = Known issue or bug

## Contributing to Documentation

To improve documentation:

1. All docs should be in Markdown format
2. Include code examples where appropriate
3. Keep language clear and concise
4. Link to related documentation
5. Update this index when adding new docs

See [Contributing Guide](contributing.md) for full guidelines.

## Documentation Standards

Good documentation should:

- **Be accurate** - Test all commands and code examples
- **Be complete** - Cover common use cases and edge cases
- **Be clear** - Use simple language and good examples
- **Be current** - Update when code changes
- **Be helpful** - Focus on solving user problems

## Quick Reference

### Test Commands

```bash
./run-tests.sh                                    # All tests
cd server && npm test                             # Server tests
cd client && npm run test:run                     # Client tests
cd server/tests/load-test-java && ./run-load-test.sh  # Load test
```

### Server Commands

```bash
cd server && npm run dev                          # Development mode
cd server && npm run build                        # Build for production
cd server && npm start                            # Production mode
```

### Client Commands

```bash
cd client && npm run dev                          # Development mode
cd client && npm run build                        # Build for production
cd client && npm run preview                      # Preview production build
```

### Docker Commands

```bash
./setup.sh                                        # Build all runtime images
docker ps                                         # List running containers
docker images | grep runtime                      # List runtime images
docker network ls | grep coderunner               # List session networks
```

## Version Information

- **Node.js**: 18+
- **Docker**: 20.10+
- **Java**: 11+ (for load testing)
- **Maven**: 3.6+ (for load testing)

## License

This project is provided for educational purposes.

---

**Last Updated:** February 9, 2026

For questions or issues, please check the documentation or create an issue in the project repository.
