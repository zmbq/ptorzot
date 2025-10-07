/**
 * Formatters for game operations and numbers
 * Ported from Android Formattings.java
 */

/**
 * Valid operation characters
 */
export type Operation = '+' | '-' | '*' | '/';

/**
 * Epsilon value for determining if a number is close enough to an integer
 */
const EPSILON = 1e-5;

/**
 * Maps operation character to display string
 * @param op Operation character (+, -, *, /)
 * @returns Display string for the operation
 */
export function getOpString(op: Operation): string {
  switch (op) {
    case '+':
      return '+';
    case '-':
      return '-';
    case '*':
      return '×'; // Unicode multiplication sign (&#215;)
    case '/':
      return '÷'; // Unicode division sign (&#247;)
    default:
      return '?';
  }
}

/**
 * Formats a number for display
 * If the number is within epsilon of an integer, displays as integer
 * Otherwise displays with 2 decimal places
 * @param n Number to format
 * @returns Formatted string
 */
export function getPrintedNumber(n: number): string {
  const rounded = Math.round(n);
  const isNearInteger = Math.abs(rounded - n) < EPSILON;
  
  if (isNearInteger) {
    return rounded.toString();
  } else {
    return n.toFixed(2);
  }
}

/**
 * Applies an operation to two numbers
 * @param a First operand
 * @param b Second operand
 * @param op Operation to apply
 * @returns Result of the operation
 */
export function applyOperation(a: number, b: number, op: Operation): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
    default:
      return 0;
  }
}
