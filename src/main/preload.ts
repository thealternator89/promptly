import { contextBridge, ipcRenderer } from 'electron';
import { Prompt } from '../types';

contextBridge.exposeInMainWorld('electronAPI', {
  getPrompts: () => ipcRenderer.invoke('get-prompts'),
  getPrompt: (id: string) => ipcRenderer.invoke('get-prompt', id),
  createPrompt: (prompt: Prompt) => ipcRenderer.invoke('create-prompt', prompt),
  deletePrompt: (id: string) => ipcRenderer.invoke('delete-prompt', id),
  savePromptsOrder: (ids: string[]) => ipcRenderer.invoke('save-prompts-order', ids),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
