# Architecture Overview

This project follows Electron's recommended security practices by separating the main (Node.js) process from the renderer (Chromium) process.

## Process Model

- **Main Process (`src/main/index.ts`):**
  - Manages application lifecycle.
  - Controls native OS features.
  - Can access Node.js APIs directly.
  - Spawns the main window.
- **Preload Script (`src/main/preload.ts`):**
  - A secure bridge between the main and renderer processes.
  - Runs in a renderer context but has access to Node.js APIs.
  - Exposes APIs to the renderer using `contextBridge.exposeInMainWorld`.
- **Renderer Process (`src/renderer/renderer.tsx`):**
  - The UI (React).
  - Runs in a sandboxed environment for security.
  - Accesses OS/Main features only through the bridge provided by the preload script.

## Inter-Process Communication (IPC)

When the renderer needs to perform a task that requires Node.js (e.g., interacting with the file system or executing shell commands), it should use IPC.

1.  **Define IPC Handler in Main Process:**
    ```typescript
    import { ipcMain } from 'electron';
    ipcMain.handle('some-action', async (event, data) => {
      // Perform action in Node.js
      return result;
    });
    ```

2.  **Expose IPC Method in Preload Script:**
    ```typescript
    import { contextBridge, ipcRenderer } from 'electron';
    contextBridge.exposeInMainWorld('electronAPI', {
      doSomething: (data) => ipcRenderer.invoke('some-action', data)
    });
    ```

3.  **Use in React Component:**
    ```typescript
    const result = await (window as any).electronAPI.doSomething(data);
    ```

## Development Workflow

- **Styling:** Vanilla CSS is preferred for maximum flexibility. Global styles should be placed in `src/renderer/index.css`.
- **Components:** React components should be modular and placed in `src/renderer/components`.
- **Types:** TypeScript is used throughout to ensure type safety. Shared types can be kept in a `src/types` directory.
