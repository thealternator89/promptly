export type PromptPartType = 'fixed' | 'custom' | 'quote' | 'code' | 'hr';

export interface BasePart {
  id: string;
  type: PromptPartType;
}

export interface FixedPart extends BasePart {
  type: 'fixed';
  text: string;
}

export interface CustomPart extends BasePart {
  type: 'custom';
  defaultText?: string;
  placeholder?: string;
}

export interface QuotePart extends BasePart {
  type: 'quote';
}

export interface CodePart extends BasePart {
  type: 'code';
  language?: string;
}

export interface HRPart extends BasePart {
  type: 'hr';
}

export type PromptPart = FixedPart | CustomPart | QuotePart | CodePart | HRPart;

export interface Prompt {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  parts: PromptPart[];
}
