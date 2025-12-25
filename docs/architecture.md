# Architecture & Design

## 📂 Project Structure

```
CodeRunner/
├── client/                 # React Frontend application
│   ├── src/                # Frontend source code
│   └── vite.config.ts      # Vite configuration
├── server/                 # Backend Node.js application
│   ├── src/
│   │   └── index.ts        # Core runner logic & example usage
│   └── temp/               # Temporary directories for execution (gitignored)
├── runtimes/               # Dockerfile definitions for language runtimes
│   └── python/             # Python runtime configuration
└── docker-compose.yml      # Service orchestration
```

## 🧩 How It Works

1.  **The Workspace**: The student opens the web interface and creates a temporary workspace. They can type code directly or import local files/folders.
2.  **Submission**: When "Run" is clicked, the editor bundles the necessary source files and sends them to the server.
3.  **Isolation**: The server creates a unique, temporary directory and spins up a language-specific Docker container.
4.  **Execution**: The files are mounted into the container, and the entry point (e.g., `main.py`) is executed.
5.  **Result**: Standard output (`stdout`) and errors (`stderr`) are captured and displayed in the browser's terminal console.

## 🛡️ Security Features

- **Network Isolation**: Containers run with `--network none`.
- **Resource Limits**: Memory and CPU usage are strictly capped.
- **Ephemeral**: Containers are removed (`--rm`) immediately after execution.
- **Timeouts**: Execution is hard-capped (default 5s) to prevent infinite loops.
