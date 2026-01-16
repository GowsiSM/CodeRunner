# Architecture

## System Overview

CodeRunner executes user code in isolated Docker containers with real-time output streaming via WebSockets. Supports **4,000+ total users** with **~200 concurrent executions** using explicit subnet allocation and TTL-based resource management.

```
┌──────────────┐  WebSocket   ┌──────────────┐  Docker   ┌──────────────┐
│   Browser    │◄────────────►│   Server     │◄─────────►│  Container   │
│   (React)    │   Socket.IO  │  (Node.js)   │           │  (Runtime)   │
└──────────────┘              └──────────────┘           └──────────────┘
```

## Network Architecture

**Subnet Allocation System:**

- Pre-configured Docker pools: `172.80.0.0/12` and `10.10.0.0/16`
- Explicit /24 subnet assignment to each session
- Deterministic allocation with counters (race-condition safe)
- Pool 1: 4,096 /24 subnets, Pool 2: 256 /24 subnets
- Total capacity: **4,352 network subnets (one per user session)**

**Session Isolation:**

```
Each session gets:
├── Unique Docker bridge network (explicit subnet)
├── On-demand containers with TTL
└── Automatic cleanup on disconnect
```

## Execution Pipeline

1. **Connection**: Client connects via Socket.IO, receives unique session ID
2. **Network**: Isolated Docker network created with pre-allocated subnet
3. **Code**: Files submitted, validated, and queued for execution
4. **Container**: On-demand container created/reused with 60s TTL
5. **Execution**: Code runs with resource limits, output streamed live
6. **Cleanup**: Container expires or network removed on disconnect

## Session-Based Container Pool

Each user session gets:

- **Isolated network**: `coderunner-session-{socketId}`
- **On-demand containers**: Created when code runs, reused within TTL
- **Automatic cleanup**: Containers expire after 60s inactivity

```
Session Connect → Network Created → Code Run → Container Created → Reused for 60s → Cleanup
                                                    ↑                    │
                                                    └────────────────────┘
```

## Container Lifecycle

| Event           | Action                                      |
| --------------- | ------------------------------------------- |
| First code run  | Create container, attach to session network |
| Subsequent runs | Reuse existing container, refresh TTL       |
| 60s inactivity  | Container auto-deleted                      |
| Disconnect      | Immediate container + network cleanup       |

## Configuration Management

All backend settings are centralized in `config.ts` with environment variable overrides:

**Server Configuration:**

- Port, host, environment, logging level

**Docker Resources:**

- Memory limits per container type
- CPU allocation per container type
- Command execution timeout

**Network Configuration:**

- Subnet pool definitions with capacity tracking
- Network prefix, driver, and label customization

**Session Management:**

- Container TTL and cleanup intervals
- Max containers per session
- Orphaned network cleanup threshold

**Runtime Images:**

- Configurable Docker image names for all languages
- File size and count limits per session

See `server/.env.example` for complete configuration reference.

## Project Structure

```
CodeRunner/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # UI components (CodeEditor, Console, Workspace)
│   │   ├── hooks/         # useSocket (WebSocket connection)
│   │   ├── stores/        # Zustand state (useEditorStore)
│   │   └── lib/           # Utilities
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── index.ts       # Socket.IO server, execution handler
│   │   ├── pool.ts        # Container pool with TTL management
│   │   ├── networkManager.ts  # Docker network lifecycle
│   │   ├── kernelManager.ts   # Notebook kernel support
│   │   └── config.ts      # Configuration
│   └── package.json
├── runtimes/              # Docker images for each language
│   ├── python/
│   ├── javascript/
│   ├── java/
│   ├── cpp/
│   └── mysql/
├── docs/                  # Documentation
└── setup.sh               # One-command setup script
```

## Performance Metrics & Capacity

| Aspect                   | Detail                                       |
| ------------------------ | -------------------------------------------- |
| **Total Users**          | 4,000+ connected sessions                    |
| **Concurrent Execution** | ~200 active containers (32GB host, 128MB ea) |
| **Network Capacity**     | 4,352 subnets available                      |
| **First Execution**      | ~1-2s (container creation + compilation)     |
| **Reused Execution**     | ~200-400ms (existing container)              |
| **Container TTL**        | 60 seconds (auto-cleanup)                    |
| **Memory per Container** | 128MB (standard), 256MB (notebooks)          |
| **CPU per Container**    | 0.5 cores (standard), 1 core (notebooks)     |
| **Execution Timeout**    | 30 seconds per run                           |
| **Load Test Result**     | 40 concurrent executions = 100% success      |

**Real-World Scaling:**
In a lab with 200 students, only 10-20% actively execute code simultaneously. The 60-second TTL ensures containers auto-delete, keeping memory usage low (~2-4GB instead of 25GB).

**Memory Planning:**

- 8GB host: ~50 concurrent executions
- 16GB host: ~100 concurrent executions
- 32GB host: ~200 concurrent executions (or 400 with `DOCKER_MEMORY=64m`)
