import { contextBridge, ipcRenderer } from 'electron';
import { Prompt } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  getPrompts: () => ipcRenderer.invoke('get-prompts'),
  createPrompt: (prompt: Prompt) => ipcRenderer.invoke('create-prompt', prompt),
});
