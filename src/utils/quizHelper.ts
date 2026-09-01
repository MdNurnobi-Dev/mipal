import { QuizQuestion } from '../types';
import { easyMathQuizQuestions } from '../data/mathQuizzes';

/**
 * Mathematically evaluates a simple math question string.
 * Supports +, -, ×, *, ÷, / operations.
 * Examples: "5 + 7 = ?", "6 × 4 = ?", "20 ÷ 4 = ?", "30 - 12 = ?"
 */
export function evaluateMathQuestion(questionStr: string): number | null {
  if (!questionStr || typeof questionStr !== 'string') return null;

  // Clean equation string
  const clean = questionStr
    .replace(/=\s*\?/g, '')
    .replace(/[=?]/g, '')
    .replace(/×/g, '*')
    .replace(/x/gi, '*')
    .replace(/÷/g, '/')
    .trim();

  // Match: number operator number
  const match = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*([+-]?\d+(?:\.\d+)?)$/);
  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);

    if (!isNaN(num1) && !isNaN(num2)) {
      if (op === '+') return num1 + num2;
      if (op === '-') return num1 - num2;
      if (op === '*') return num1 * num2;
      if (op === '/' && num2 !== 0) return num1 / num2;
    }
  }

  return null;
}

/**
 * Determines whether the user's selected option index is correct for a given question.
 * Uses mathematical evaluation, index normalization, and text matching.
 */
export function isQuizAnswerCorrect(
  question: QuizQuestion,
  selectedOptionIndex: number
): boolean {
  if (!question || !Array.isArray(question.options) || question.options.length === 0) {
    return false;
  }

  const selectedText = String(question.options[selectedOptionIndex] ?? '').trim();
  if (!selectedText) return false;

  // 1. Primary Strategy: Mathematical evaluation (100% bulletproof for math questions)
  const mathResult = evaluateMathQuestion(question.question);
  if (mathResult !== null) {
    const selectedNum = parseFloat(selectedText);
    if (!isNaN(selectedNum) && Math.abs(selectedNum - mathResult) < 0.0001) {
      return true;
    }
    // Also check string representation
    if (selectedText === String(mathResult)) {
      return true;
    }
  }

  // 2. Secondary Strategy: Safe Number type-coerced correctIndex (0-based)
  const rawCorrectIndex = Number(question.correctIndex);
  if (!isNaN(rawCorrectIndex)) {
    // 0-based check: e.g. correctIndex is 0, 1, 2, 3
    if (selectedOptionIndex === rawCorrectIndex) {
      return true;
    }

    // 1-based check tolerance: if correctIndex was set to 1..4
    if (rawCorrectIndex >= 1 && rawCorrectIndex <= question.options.length) {
      if (selectedOptionIndex === rawCorrectIndex - 1) {
        return true;
      }
    }

    // Check if the option value at correctIndex matches selected option text
    const correctOptionText = question.options[rawCorrectIndex];
    if (correctOptionText && String(correctOptionText).trim().toLowerCase() === selectedText.toLowerCase()) {
      return true;
    }
  }

  // 3. Tertiary Strategy: Explicit correctAnswer field if attached
  const explicitAnswer = (question as any).correctAnswer || (question as any).answer;
  if (explicitAnswer !== undefined && explicitAnswer !== null) {
    if (String(explicitAnswer).trim().toLowerCase() === selectedText.toLowerCase()) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes and normalizes a pool of quiz questions to ensure valid options and correctIndex.
 */
export function sanitizeQuizQuestions(pool: any[]): QuizQuestion[] {
  if (!Array.isArray(pool) || pool.length === 0) {
    return easyMathQuizQuestions;
  }

  return pool.map((item, idx) => {
    const questionText = item.question || `Question ${idx + 1}`;
    let options: string[] = [];

    if (Array.isArray(item.options)) {
      options = item.options.map((o: any) => String(o).trim());
    } else if (typeof item.options === 'string') {
      try {
        options = JSON.parse(item.options);
      } catch (e) {
        options = item.options.split(',').map((s: string) => s.trim());
      }
    }

    // Calculate math answer if possible
    const mathAns = evaluateMathQuestion(questionText);
    let resolvedCorrectIndex = Number(item.correctIndex);

    if (isNaN(resolvedCorrectIndex) || resolvedCorrectIndex < 0 || resolvedCorrectIndex >= options.length) {
      resolvedCorrectIndex = 0;
    }

    // If mathematical calculation succeeds, ensure the correct answer is aligned in options
    if (mathAns !== null) {
      const matchIdx = options.findIndex(opt => parseFloat(opt) === mathAns || opt.trim() === String(mathAns));
      if (matchIdx !== -1) {
        resolvedCorrectIndex = matchIdx;
      } else {
        // If correct answer isn't in options, add/replace
        if (options.length < 4) {
          options.push(String(mathAns));
          resolvedCorrectIndex = options.length - 1;
        } else {
          options[resolvedCorrectIndex] = String(mathAns);
        }
      }
    }

    return {
      question: questionText,
      options: options.length >= 2 ? options : ['10', '15', '20', '25'],
      correctIndex: resolvedCorrectIndex
    };
  });
}
