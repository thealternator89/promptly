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
- `heading`: H1, H2, or H3 headers with an optional "Exclude if next part is empty" toggle.
- `hr`: Horizontal rule divider.
- `repeatable`: A recursive container that holds a template of other parts.

### Repeatable Sections
The architecture supports recursive nesting of parts within repeatable sections. In the Viewer, these sections can be instantiated multiple times.

## State Management (Viewer)

To handle dynamic instances of repeatable sections without complex nested state, the Viewer uses **Composite Keys**:
- **Format:** `parentId_instanceId_childId`
- **Benefit:** Keeps the state flat in a single object while ensuring each input field in every instance remains unique and isolated.

### Session-based Mutability
The Viewer maintains its own local copy of the prompt parts list. This allows users to reorder or delete specific parts via drag-and-drop for a specific generation session without affecting the saved library template.

## Scratchpad

The **Scratchpad** is a special virtual prompt accessible via the `/viewer/scratchpad` route. It shares the same rendering logic as the standard Viewer but is initialized with a blank slate. Users can add parts on-the-fly, and use the "Add to Library" feature to persist their scratchpad creation as a new permanent template.

## Inter-Process Communication (IPC)

The renderer communicates with the main process for file operations and app metadata:
1. `get-prompts`: Retrieves all saved prompts.
2. `get-prompt`: Fetches a specific prompt by ID.
3. `create-prompt`: Saves or updates a prompt.
4. `delete-prompt`: Removes a prompt and updates the library order.
5. `save-prompts-order`: Persists the custom order of prompts in the library.
6. `get-settings`: Retrieves application-wide settings (e.g., disallowed domains).
7. `save-settings`: Persists updated application settings.
8. `get-app-version`: Returns the version string from `package.json`.

## Configuration & Security

### URL Sanitization
To prevent accidental exposure of internal or sensitive links when sharing prompts, the application supports a **Disallowed Domains** list. During the copy-to-clipboard operation, the application parses markdown and HTML links, stripping the URL if it matches a disallowed domain while preserving the anchor text.

### User Interface & Experience
- **Selection Control:** To mimic a native application, text selection is disabled globally using `user-select: none`. It is surgically re-enabled for inputs, textareas, code blocks, and specific content areas.
- **Persistent Layout:** The app uses a shared `App.tsx` layout with a custom title bar and a global footer for version tracking.
- **Sticky Navigation:** Both the Editor and Viewer implement sticky header bars. This ensures that primary actions (Save, Cancel, Copy, Add to Library) remain accessible even when working with long, complex prompts.

## Development Workflow

- **Styling:** Vanilla CSS + Bootstrap 5.
- **Components:** Modular React components in `src/renderer/components`.
- **Interactions:** Drag-and-drop reordering is powered by `@dnd-kit`.
- **Types:** Centralized TypeScript definitions in `src/types/index.ts`.
- **Assets:** Binary files (icons, logos) are managed via Git LFS.
