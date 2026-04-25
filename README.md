# Promptly

An Electron-based desktop AI prompt builder and library, built with React and TypeScript using Electron Forge.

## Tech Stack

- **Framework:** [Electron](https://www.electronjs.org/) (via [Electron Forge](https://www.electronforge.io/))
- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Webpack](https://webpack.js.org/)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Running the Application (Development)

```bash
npm start
```

### Packaging for Distribution

```bash
npm run package
# or
npm run make
```

## Project Structure

The project follows a clean separation of concerns between the main (backend) and renderer (frontend) processes.

```text
.
├── src/
│   ├── main/           # Main process logic (Node.js environment)
│   │   ├── index.ts    # Main process entry point
│   │   └── preload.ts  # Preload script for IPC and secure bridge
│   └── renderer/       # Renderer process (React environment)
│       ├── App.tsx     # Main React component
│       ├── index.css   # Global styles
│       ├── index.html  # Main HTML template
│       └── renderer.tsx # Renderer entry point (React mount)
├── forge.config.ts     # Electron Forge configuration
├── tsconfig.json       # TypeScript configuration
├── webpack.main.config.ts     # Webpack config for main process
└── webpack.renderer.config.ts # Webpack config for renderer process
```

## Architecture

For a detailed explanation of the process model and inter-process communication (IPC), see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## License

MIT
