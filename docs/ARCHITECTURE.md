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

The renderer communicates with the main process for file operations:
1. `get-prompts`: Retrieves all saved prompts.
2. `get-prompt`: Fetches a specific prompt by ID.
3. `create-prompt`: Saves or updates a prompt.

## Development Workflow

- **Styling:** Vanilla CSS + Bootstrap 5.
- **Components:** Modular React components in `src/renderer/components`.
- **Types:** Centralized TypeScript definitions in `src/types/index.ts`.
- **Assets:** Binary files (icons, logos) are managed via Git LFS.
