import { ButtonConfig, CalcMode, ToolDefinition, ToolCategory } from './types';
import { 
  Calculator, Landmark, Ruler, Heart, Clock, GraduationCap, Gamepad2, 
  Activity, Scale, Calendar, Zap, DollarSign, Percent, Map, Compass, Timer, Palette
} from 'lucide-react';

export const APP_NAME = "Universal Computational Engine";

// --- Keypad Configurations ---
export const BASIC_KEYS: ButtonConfig[] = [
  // Row 1
  { label: 'C', value: 'clear', action: 'clear', className: 'bg-red-500 hover:bg-red-600 text-white' },
  { label: '⌫', value: 'delete', action: 'delete', className: 'bg-red-500 hover:bg-red-600 text-white' },
  { label: '(', value: '(', action: 'operator' },
  { label: ')', value: ')', action: 'operator' },

  // Row 2
  { label: '7', value: '7', action: 'digit' },
  { label: '8', value: '8', action: 'digit' },
  { label: '9', value: '9', action: 'digit' },
  { label: '÷', value: '/', action: 'operator', className: 'bg-amber-500 hover:bg-amber-600 text-white' },

  // Row 3
  { label: '4', value: '4', action: 'digit' },
  { label: '5', value: '5', action: 'digit' },
  { label: '6', value: '6', action: 'digit' },
  { label: '×', value: '*', action: 'operator', className: 'bg-amber-500 hover:bg-amber-600 text-white' },

  // Row 4
  { label: '1', value: '1', action: 'digit' },
  { label: '2', value: '2', action: 'digit' },
  { label: '3', value: '3', action: 'digit' },
  { label: '-', value: '-', action: 'operator', className: 'bg-amber-500 hover:bg-amber-600 text-white' },

  // Row 5
  { label: '0', value: '0', action: 'digit' }, // Spans 1 col now in standard grid
  { label: '.', value: '.', action: 'digit' },
  { label: '=', value: '=', action: 'evaluate', className: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: '+', value: '+', action: 'operator', className: 'bg-amber-500 hover:bg-amber-600 text-white' },
];

export const SCIENTIFIC_KEYS: ButtonConfig[] = [
  { label: 'sin', value: 'sin(', action: 'function' },
  { label: 'cos', value: 'cos(', action: 'function' },
  { label: 'tan', value: 'tan(', action: 'function' },
  { label: 'π', value: 'pi', action: 'digit' },
  { label: 'ln', value: 'log(', action: 'function' },
  { label: 'log', value: 'log10(', action: 'function' },
  { label: 'e', value: 'e', action: 'digit' },
  { label: '^', value: '^', action: 'operator' },
  { label: '√', value: 'sqrt(', action: 'function' },
  { label: '!', value: '!', action: 'operator' },
  { label: '|x|', value: 'abs(', action: 'function' },
  { label: 'deg', value: 'deg', action: 'digit' },
];

export const FINANCIAL_KEYS: ButtonConfig[] = [
  { label: 'PV', value: 'PV(', action: 'function', tooltip: 'Present Value' },
  { label: 'FV', value: 'FV(', action: 'function', tooltip: 'Future Value' },
  { label: 'NPV', value: 'NPV(', action: 'function', tooltip: 'Net Present Value' },
  { label: 'PMT', value: 'PMT(', action: 'function', tooltip: 'Payment' },
  { label: 'IRR', value: 'IRR(', action: 'function', tooltip: 'Internal Rate of Return' },
  { label: '%', value: '%', action: 'operator' },
];

export const ENGINEERING_KEYS: ButtonConfig[] = [
  { label: 'i', value: 'i', action: 'digit', tooltip: 'Imaginary Unit' },
  { label: 'Re', value: 're(', action: 'function', tooltip: 'Real Part' },
  { label: 'Im', value: 'im(', action: 'function', tooltip: 'Imaginary Part' },
  { label: 'conj', value: 'conj(', action: 'function', tooltip: 'Conjugate' },
  { label: 'det', value: 'det(', action: 'function', tooltip: 'Determinant' },
  { label: 'inv', value: 'inv(', action: 'function', tooltip: 'Matrix Inverse' },
];

export const CHEMISTRY_KEYS: ButtonConfig[] = [
  { label: 'mol', value: 'mol', action: 'digit' },
  { label: 'Na', value: '6.022e23', action: 'digit', tooltip: 'Avogadro Constant' },
  { label: 'R', value: '8.314', action: 'digit', tooltip: 'Gas Constant' },
  { label: 'atm', value: 'atm', action: 'digit' },
];

// --- New Tool Registry ---

export const TOOLS: ToolDefinition[] = [
  // Financial
  { id: 'loan', label: 'Loan / Mortgage', icon: DollarSign, category: ToolCategory.FINANCIAL, description: 'Calculate monthly payments and amortization.', component: 'LOAN_CALC' },
  { id: 'interest', label: 'Compound Interest', icon: Percent, category: ToolCategory.FINANCIAL, description: 'Future value with compound interest.', component: 'LOAN_CALC' },
  
  // Engineering / Tech / Math
  { id: 'unit_conv', label: 'Unit Converter', icon: Ruler, category: ToolCategory.CONVERTER, description: 'Length, Mass, Temperature, Volume.', component: 'UNIT_CONV' },
  { id: 'land_conv', label: 'Land Measurement', icon: Map, category: ToolCategory.CONVERTER, description: 'Acres, Hectares, Bigha, Katha (BD/Intl).', component: 'LAND_CONV' },
  { id: 'laplace', label: 'Laplace / Fourier', icon: Activity, category: ToolCategory.ENGINEERING, description: 'Symbolic transforms via AI.', aiPrompt: 'Perform Laplace or Fourier transforms. Show steps.' },
  { id: 'diff_eq', label: 'Differential Eq', icon: Activity, category: ToolCategory.ENGINEERING, description: 'ODE/PDE solver with steps.', aiPrompt: 'Solve the differential equation. Show steps.' },
  { id: 'stats', label: 'Statistics', icon: Scale, category: ToolCategory.STATS, description: 'Mean, Median, Mode, Std Dev, Variance.', component: 'STATS_CALC' },
  { id: 'compass', label: 'Digital Compass', icon: Compass, category: ToolCategory.MISC, description: 'High-precision directional finder.', component: 'COMPASS' },

  // Health
  { id: 'bmi', label: 'BMI Calculator', icon: Activity, category: ToolCategory.HEALTH, description: 'Body Mass Index (Metric & Standard).', component: 'BMI_CALC' },
  { id: 'age', label: 'Age Calculator', icon: Calendar, category: ToolCategory.HEALTH, description: 'Exact age in years, months, days.', component: 'AGE_CALC' },
  { id: 'skin_tone', label: 'Skin Tone Matcher', icon: Palette, category: ToolCategory.HEALTH, description: 'Find your skin undertone and perfect colors.', component: 'SKIN_TONE' },

  // Time
  { id: 'date_diff', label: 'Date Difference', icon: Clock, category: ToolCategory.TIME, description: 'Calculate duration between two dates.', component: 'DATE_DIFF' },

  // Education
  { id: 'gpa', label: 'GPA Calculator', icon: GraduationCap, category: ToolCategory.EDUCATION, description: 'Calculate Grade Point Average.', component: 'GPA_CALC' },
  
  // Misc
  { id: 'random', label: 'Random Generator', icon: Gamepad2, category: ToolCategory.MISC, description: 'Generate numbers or passwords.', component: 'RANDOM_GEN' },
];

// --- Land Conversion Factors (Base Unit: Square Feet) ---
export const LAND_UNITS: Record<string, number> = {
  'sq_ft': 1,
  'sq_meter': 10.7639,
  'acre': 43560,
  'hectare': 107639,
  'decimal': 435.6, // Bangladesh/India standard
  'katha': 720,     // Standard (varies, using 720 sq ft common standardization)
  'bigha': 14400,   // Standard (20 Katha)
  'satak': 435.6    // Same as Decimal
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];