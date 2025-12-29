# 🏁 Getting Started Guide

This guide shows how to set up and run CodeRunner locally or on a remote machine.

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **Docker** (Must be installed and running)
- **npm**
- **git** (for cloning the repository)

⚠️ **Note:** If using GitHub Codespaces, Node.js, npm, and Docker are already installed.

---

## 💻 Local Setup (Laptop/PC)

### Step 1: Clone the Repository

```bash
git clone https://www.github.com/hemanthkumar2k04/CodeRunner.git
cd CodeRunner
```

### Method - 1: Automated Setup Script (Recommended)

Run the provided setup script to automate building Docker images and starting the servers:

```bash
chmod +x setup.sh
sudo ./setup.sh
```

This script will:

- Build necessary Docker runtime images
- Setup frontend and backend

### Method - 2: Manual Setup

### Step 2: Build Docker Runtime Images

The system requires Docker images for each programming language. Build the ones you need:

```bash
# Build Python runtime
cd runtimes/python
docker build -t python-runtime .

# Build JavaScript/Node runtime
cd ../javascript
docker build -t node-runtime .

# Build Java runtime (optional)
cd ../java
docker build -t java-runtime .

# Build C++ runtime (optional)
cd ../cpp
docker build -t cpp-runtime .

# Return to root
cd ../..
```

**Note:** At minimum, build the `python-runtime` image. Add others as needed.

### Step 3: Set Up and Start the Backend Server

```bash
cd server
npm install
npm run dev
```

The backend server will start on `http://localhost:3000`.

You should see output like:

```
Container Pool Initialized 🚀
Server running on http://localhost:3000
```

### Step 4: Set Up and Start the Frontend (In a New Terminal)

```bash
cd client
npm install
npm run dev
```

Vite will start and show:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### Step 5: Open in Browser

- **Local access**: Open `http://localhost:5173/` in your browser
- **Remote access**: Use the Network URL shown above to access from another machine

---

## 🌐 Accessing from Another Machine

Both the backend and frontend are configured to be network-accessible:

1. **Frontend**: Accessible via the Network URL printed by Vite (e.g., `http://192.168.0.250:5173/`)
2. **Backend**: The frontend automatically detects the server IP and connects to port 3000 on the same host

### Example:

If you run CodeRunner on machine `192.168.0.250`:

- Access frontend from another machine: `http://192.168.0.250:5173/`
- Backend automatically connects to: `http://192.168.0.250:3000/`

---

## 🔧 Configuration

### Server Configuration

Edit `server/src/config.ts` to customize:

- Server port (default: 3000)
- Container pool size (default: 3 per language)
- Memory limits per container
- CPU limits per container
- Execution timeout (default: 5000ms)
- Supported languages and Docker images

### Frontend Configuration

**Environment Variables:**

Create a `.env.local` file in the `client/` directory:

```env
VITE_SERVER_URL=http://your-server-ip:3000
```

If not set, the frontend will automatically use the same hostname it's accessed from.

**Vite Server:**

Edit `client/vite.config.ts` to change the development server:

```typescript
server: {
  host: '0.0.0.0',  // Expose to all network interfaces
  port: 5173,
}
```

---

## 🐳 Docker Setup Troubleshooting

### Issue: "Cannot connect to Docker daemon"

**Solution:** Ensure Docker is running:

```bash
# On Linux
sudo systemctl start docker

# On Mac
open /Applications/Docker.app

# On Windows
# Start Docker Desktop from Start menu
```

### Issue: "Permission denied" when building images

**Solution:** On Linux, add your user to the docker group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🚀 Using CodeRunner

### Creating and Running Code

1. **Create a file**: Click the `+` icon in the Workspace explorer
2. **Write code**: The file opens automatically in the Monaco editor
3. **Save**: Press `Ctrl+S` (or `Cmd+S` on Mac)
4. **Run**: Click the **Run** button or press `Ctrl+Enter`
5. **View output**: Console output appears in real-time in the bottom panel

### Supported File Extensions

| Language   | Extensions     | Required Runtime |
| ---------- | -------------- | ---------------- |
| Python     | `.py`          | `python-runtime` |
| JavaScript | `.js`          | `node-runtime`   |
| Java       | `.java`        | `java-runtime`   |
| C++        | `.cpp`, `.c++` | `cpp-runtime`    |

### Example: Running Python

1. Create a file named `hello.py`
2. Write:
   ```python
   for i in range(5):
       print(f"Hello {i}")
   ```
3. Click **Run**
4. See output in the console

---

## ⚙️ Development

### Running in Development Mode

**Backend:**

```bash
cd server
npm run dev        # Runs with ts-node (auto-reload)
```

**Frontend:**

```bash
cd client
npm run dev        # Runs with Vite (auto-reload)
```

### Building for Production

**Backend:**

```bash
cd server
npm run build
npm start
```

**Frontend:**

```bash
cd client
npm run build
# Serve the `dist/` folder with a static server
```

---

## 📋 Common Issues

### Issue: "Port 3000 or 5173 already in use"

**Solution:** Kill the process using the port:

```bash
# On Linux/Mac
lsof -i :3000      # Find process ID
kill -9 <PID>      # Kill it

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Frontend can't connect to backend

**Solution:**

1. Ensure backend is running: `http://localhost:3000/`
2. Check the browser console (F12) for connection errors
3. On remote access, use the Network URL for frontend
4. Backend automatically detects the server IP

### Issue: Docker containers not starting

**Solution:**

1. Verify Docker is running: `docker ps`
2. Check images exist: `docker images | grep runtime`
3. Check server logs for detailed errors
4. Rebuild images if needed

---

## 📖 Next Steps

- Read [Architecture & Design](architecture.md) to understand how execution works
- Check [Tech Stack](tech-stack.md) for technology details
- See [Contributing](contributing.md) to contribute to the project
