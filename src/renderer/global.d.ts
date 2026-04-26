import { Prompt } from '../types';

export interface ElectronAPI {
  getPrompts: () => Promise<Prompt[]>;
  getPrompt: (id: string) => Promise<Prompt>;
  createPrompt: (prompt: Prompt) => Promise<void>;
  savePromptsOrder: (ids: string[]) => Promise<void>;
  getSettings: () => Promise<{ disallowedDomains: string }>;
  saveSettings: (settings: { disallowedDomains: string }) => Promise<void>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
