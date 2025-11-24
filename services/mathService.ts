import { create, all } from 'mathjs';

// Configure mathjs
const config = {
  epsilon: 1e-12,
  matrix: 'Matrix' as 'Matrix',
  number: 'BigNumber' as 'BigNumber', // Default to BigNumber for precision
  precision: 64, // 64 digits of precision
  predictable: false,
  randomSeed: null
};

const math = create(all, config);

export const evaluateLocalExpression = (expression: string): string => {
  try {
    if (!expression.trim()) return '';

    // Basic sanitization
    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/e/g, 'e'); // Ensure e is treated as constant

    const result = math.evaluate(sanitized);

    // Handle undefined or null results safely
    if (result === undefined || result === null) {
        return '';
    }

    // Format output based on type
    if (math.isBigNumber(result)) {
      return result.toString();
    } else if (math.isMatrix(result)) {
      return result.toString();
    } else if (typeof result === 'number') {
      return math.format(result, { precision: 14 });
    } else if (typeof result === 'function') {
      return 'Function';
    } else if (result.toString) {
        return result.toString();
    }
    
    return String(result);
  } catch (error) {
    // console.error("MathJS Error:", error); // Optional: keep console clean
    throw new Error("Syntax Error");
  }
};

// Helper to check if simple enough for local
export const isSimpleCalculation = (expression: string): boolean => {
    // If it contains natural language words, it's not simple
    // Exception for math functions
    const allowedWords = /^(sin|cos|tan|log|log10|sqrt|abs|det|inv|pi|deg|rad|exp|ln|re|im|conj|mol|atm|i|e)$/i;
    
    const words = expression.match(/[a-zA-Z]+/g);
    if (!words) return true;

    return words.every(w => allowedWords.test(w));
};