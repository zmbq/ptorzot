/**
 * OnePlay represents a single move in the game
 * Ported from Android GameState.OnePlay inner class
 */

import { applyOperation, type Operation } from './formatters';

/**
 * Represents a single play/move in the game
 * Stores the state before and after applying an operation to two numbers
 */
export class OnePlay {
  private readonly _first: number;
  private readonly _second: number;
  private readonly _op: Operation;
  private readonly _numbersPre: number[];
  private readonly _numbersPost: number[];

  /**
   * Creates a new play
   * @param first Index of the first number
   * @param second Index of the second number
   * @param op Operation to apply
   * @param numbersPre Array of numbers before this play
   * @throws Error if indices are invalid or operation is invalid
   */
  constructor(first: number, second: number, op: Operation, numbersPre: number[]) {
    this._first = first;
    this._second = second;
    this._op = op;
    this._numbersPre = [...numbersPre]; // Clone the array

    this.checkPlay();
    this._numbersPost = this.createNumbersPost();
  }

  /**
   * Validates the play parameters
   * @throws Error if parameters are invalid
   */
  private checkPlay(): void {
    const validOps: Operation[] = ['+', '-', '*', '/'];
    if (!validOps.includes(this._op)) {
      throw new Error(`Op cannot be '${this._op}'`);
    }

    if (this._first < 0 || this._second < 0 || this._first === this._second) {
      throw new Error('First and second must be non-negative and different');
    }

    if (this._first >= this._numbersPre.length || this._second >= this._numbersPre.length) {
      throw new Error('Indices out of bounds');
    }
  }

  /**
   * Creates the post-operation number array
   * Applies the operation and removes the second number
   * @returns New array with the result
   */
  private createNumbersPost(): number[] {
    const result = applyOperation(
      this._numbersPre[this._first],
      this._numbersPre[this._second],
      this._op
    );

    // Clone the pre array
    const numbersPost = [...this._numbersPre];
    
    // Replace first number with result
    numbersPost[this._first] = result;
    
    // Remove second number by shifting array
    for (let i = this._second; i < this._numbersPre.length - 1; i++) {
      numbersPost[i] = numbersPost[i + 1];
    }
    
    // Remove last element (now duplicate)
    numbersPost.pop();

    return numbersPost;
  }

  // Getters
  get first(): number {
    return this._first;
  }

  get second(): number {
    return this._second;
  }

  get op(): Operation {
    return this._op;
  }

  get numbersPre(): readonly number[] {
    return this._numbersPre;
  }

  get numbersPost(): readonly number[] {
    return this._numbersPost;
  }

  /**
   * Serializes the play to JSON
   */
  toJSON(): object {
    return {
      first: this._first,
      second: this._second,
      op: this._op,
      numbersPre: this._numbersPre,
      numbersPost: this._numbersPost,
    };
  }

  /**
   * Deserializes a play from JSON
   */
  static fromJSON(data: {
    first: number;
    second: number;
    op: Operation;
    numbersPre: number[];
    numbersPost: number[];
  }): OnePlay {
    const play = new OnePlay(data.first, data.second, data.op, data.numbersPre);
    // Validate that the computed numbersPost matches the stored one
    if (JSON.stringify(play._numbersPost) !== JSON.stringify(data.numbersPost)) {
      throw new Error('Deserialized play has inconsistent numbersPost');
    }
    return play;
  }
}
