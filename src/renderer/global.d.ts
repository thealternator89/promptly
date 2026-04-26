import { Prompt } from '../types';

export interface IElectronAPI {
  getPrompts: () => Promise<Prompt[]>;
  createPrompt: (prompt: Prompt) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
