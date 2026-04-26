import { Prompt } from '../types';

export interface ElectronAPI {
  getPrompts: () => Promise<Prompt[]>;
  getPrompt: (id: string) => Promise<Prompt>;
  createPrompt: (prompt: Prompt) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
