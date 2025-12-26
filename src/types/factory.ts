/**
 * Factory types for generating and rendering content
 */

/**
 * Input type for generation operations
 */
export type GenInput = {
  prompt: string;
  [key: string]: unknown;
};

/**
 * Output type for generation operations
 */
export type GenOutput = {
  result: string;
  [key: string]: unknown;
};

/**
 * Input type for render operations
 */
export type RenderInput = {
  template: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Output type for render operations
 */
export type RenderOutput = {
  html: string;
  [key: string]: unknown;
};
