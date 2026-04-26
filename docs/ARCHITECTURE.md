# Architecture Overview

This project follows Electron's recommended security practices by separating the main (Node.js) process from the renderer (Chromium) process.

## Process Model

- **Main Process (`src/main/index.ts`):**
  - Manages application lifecycle and native OS features.
  - Handles file persistence for prompts in the user data directory.
- **Preload Script (`src/main/preload.ts`):**
  - Secure bridge exposing safe IPC methods to the renderer.
- **Renderer Process (`src/renderer/renderer.tsx`):**
  - React-based UI that manages state and user interaction.

## Data Structure

Prompts are stored as JSON files. A `Prompt` consists of multiple `PromptPart` objects, which can be:
- `fixed`: Static text.
- `custom`: User-fillable text field.
- `quote`: Blockquote text.
- `code`: Formatted code block with language selection.
- `repeatable`: A recursive container that holds a template of other parts.

### Repeatable Sections
The architecture supports recursive nesting of parts within repeatable sections. In the Viewer, these sections can be instantiated multiple times.

## State Management (Viewer)

To handle dynamic instances of repeatable sections without complex nested state, the Viewer uses **Composite Keys**:
- **Format:** `parentId_instanceId_childId`
- **Benefit:** Keeps the state flat in a single object while ensuring each input field in every instance remains unique and isolated.

## Inter-Process Communication (IPC)

The renderer communicates with the main process for file operations and app metadata:
1. `get-prompts`: Retrieves all saved prompts.
2. `get-prompt`: Fetches a specific prompt by ID.
3. `create-prompt`: Saves or updates a prompt.
4. `save-prompts-order`: Persists the custom order of prompts in the library.
5. `get-settings`: Retrieves application-wide settings (e.g., disallowed domains).
6. `save-settings`: Persists updated application settings.
7. `get-app-version`: Returns the version string from `package.json`.

## Configuration & Security

### URL Sanitization
To prevent accidental exposure of internal or sensitive links when sharing prompts, the application supports a **Disallowed Domains** list. During the copy-to-clipboard operation, the application parses markdown and HTML links, stripping the URL if it matches a disallowed domain while preserving the anchor text.

### User Interface & Experience
- **Selection Control:** To mimic a native application, text selection is disabled globally using `user-select: none`. It is surgically re-enabled for inputs, textareas, code blocks, and specific content areas to ensure functionality without sacrificing the "app-like" feel.
- **Persistent Layout:** The app uses a shared `App.tsx` layout with a custom title bar and a global footer for version tracking.

## Development Workflow

- **Styling:** Vanilla CSS + Bootstrap 5.
- **Components:** Modular React components in `src/renderer/components`.
- **Types:** Centralized TypeScript definitions in `src/types/index.ts`.
- **Assets:** Binary files (icons, logos) are managed via Git LFS.
