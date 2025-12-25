# CodeRunner

CodeRunner is a centralized code execution platform designed for educational lab environments. Its primary goal is to provide a seamless coding experience for multiple programming languages without requiring students to install compilers, interpreters, or runtime environments on their local machines.

The server hosts a local web application featuring a full-featured code editor. Students can write code, import local files or folders into a temporary workspace, and execute their programs instantly. The code runs securely within isolated Docker containers on the server, and the output is streamed back to the browser.

## ✨ Key Features

- **Zero-Setup Lab Environment**: Students can start coding immediately using just a web browser. No local software installation is required.
- **Multi-File Project Support**: Unlike simple snippet runners, CodeRunner supports complex projects. You can upload multiple files (e.g., a Python script importing a custom class from another file) and execute them together.
- **Smart Execution**: The system is designed to handle dependencies between files, ensuring that all necessary context is available during execution.
- **Secure Sandbox**: All code runs in ephemeral, network-isolated Docker containers, ensuring the host server remains safe from malicious or accidental damage.

## 📚 Documentation

For detailed information about the project, please refer to the documentation in the `docs/` folder:

- [**Getting Started**](docs/getting-started.md): Installation and setup instructions.
- [**Architecture & Design**](docs/architecture.md): Project structure, execution flow, and security features.
- [**Tech Stack**](docs/tech-stack.md): Technologies used in the frontend and backend.
- [**Contributing**](docs/contributing.md): Guidelines for contributing to the project.

