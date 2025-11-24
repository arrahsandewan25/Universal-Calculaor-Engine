export enum CalcMode {
  BASIC = 'BASIC',
  SCIENTIFIC = 'SCIENTIFIC',
  FINANCIAL = 'FINANCIAL',
  ENGINEERING = 'ENGINEERING',
  CHEMISTRY = 'CHEMISTRY',
  AI_CAS = 'AI_CAS'
}

export enum AppView {
  CALCULATOR = 'CALCULATOR',
  DASHBOARD = 'DASHBOARD',
  TOOL = 'TOOL'
}

export enum ToolCategory {
  FINANCIAL = 'Financial & Business',
  ENGINEERING = 'Technical & Engineering',
  STATS = 'Statistics & Math',
  HEALTH = 'Health & Lifestyle',
  TIME = 'Time & Date',
  EDUCATION = 'Education',
  CONVERTER = 'Converters',
  MISC = 'Miscellaneous'
}

export interface ToolDefinition {
  id: string;
  label: string;
  icon: any; // Lucide icon component
  category: ToolCategory;
  description: string;
  component?: string; // ID of component to render
  aiPrompt?: string; // If it uses the AI engine, this is the context
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode: CalcMode | string;
  isAi?: boolean;
}

export interface ButtonConfig {
  label: string;
  value: string;
  action?: 'clear' | 'delete' | 'evaluate' | 'module' | 'function' | 'operator' | 'digit';
  className?: string; // Tailwind overrides
  tooltip?: string;
}

export interface GeminiResponse {
  text: string;
  latex?: string;
  explanation?: string;
  isError?: boolean;
}