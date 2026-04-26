export type PromptPartType = 'fixed' | 'custom' | 'quote' | 'code' | 'hr' | 'repeatable' | 'heading';

export interface BasePart {
  id: string;
  type: PromptPartType;
}

export interface FixedPart extends BasePart {
  type: 'fixed';
  text: string;
}

export interface HeadingPart extends BasePart {
  type: 'heading';
  text: string;
  level: 1 | 2 | 3;
  excludeIfNextEmpty?: boolean;
}

export interface CustomPart extends BasePart {
  type: 'custom';
  defaultText?: string;
  placeholder?: string;
  singleLine?: boolean;
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

export interface RepeatablePart extends BasePart {
  type: 'repeatable';
  templateParts: PromptPart[];
}

export type PromptPart = FixedPart | CustomPart | QuotePart | CodePart | HRPart | RepeatablePart | HeadingPart;

export interface Prompt {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  parts: PromptPart[];
}
