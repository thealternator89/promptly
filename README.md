# Promptly

An Electron-based desktop AI prompt builder and library. Craft modular AI templates with dynamic inputs, repeatable sections, and rich formatting in a sleek, custom-branded interface.

## Features

- **Modular Library:** Store and manage your prompt collection in one place.
- **Repeatable Sections:** Define template blocks that can be duplicated multiple times in the viewer.
- **Dynamic Inputs:** Add custom fields, code blocks (with language support), and quoted sections.
- **Precision Copying:** One-click copy with intelligent formatting (e.g., proper markdown quoting).
- **Custom Branding:** Polished desktop experience with dedicated app icons and logo.

## Tech Stack

- **Framework:** [Electron](https://www.electronjs.org/) (via [Electron Forge](https://www.electronforge.io/))
- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Webpack](https://webpack.js.org/)
- **Styling:** Bootstrap 5 + FontAwesome 7
- **Binary Assets:** Git LFS for icons and logos

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Git LFS](https://git-lfs.github.com/) (required for binary assets)

### Installation

```bash
git lfs install
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

```text
.
├── assets/             # Branding assets (icons, logos)
├── src/
│   ├── main/           # Main process logic (Node.js)
│   │   ├── index.ts    # Main process entry point & IPC handlers
│   │   └── preload.ts  # Secure IPC bridge
│   ├── renderer/       # Renderer process (React)
│   │   ├── components/ # Modular UI components (Library, Editor, Viewer)
│   │   ├── App.tsx     # App routing and layout
│   │   └── renderer.tsx # React entry point
│   └── types/          # Shared TypeScript definitions
├── forge.config.ts     # Electron Forge configuration
└── tsconfig.json       # TypeScript configuration
```

## Architecture

For a detailed explanation of the process model, data structure, and inter-process communication (IPC), see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## License

MIT
