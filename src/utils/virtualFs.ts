/**
 * Virtual Filesystem Utilities
 * Provides functionality to apply virtual file artifacts to the filesystem
 * 
 * Last Updated: 2025-12-26 07:02:46 UTC
 */

import fs from 'fs';
import path from 'path';

/**
 * Represents a virtual file artifact
 */
export interface FileArtifact {
  /** Path to the file relative to the project root */
  path: string;
  /** Content of the file */
  content: string;
  /** Optional: File encoding (default: 'utf-8') */
  encoding?: BufferEncoding;
}

/**
 * Applies virtual file artifacts to the filesystem
 * Creates necessary directories and writes files with the provided content
 * 
 * @param artifacts - Array of file artifacts to apply
 * @param basePath - Base path where files will be written (default: current working directory)
 * @returns Promise that resolves when all files have been written
 * @throws Error if file writing fails
 * 
 * @example
 * ```typescript
 * const artifacts: FileArtifact[] = [
 *   {
 *     path: 'src/index.ts',
 *     content: 'export const hello = "world";'
 *   },
 *   {
 *     path: 'README.md',
 *     content: '# My Project'
 *   }
 * ];
 * 
 * await applyArtifacts(artifacts);
 * ```
 */
export async function applyArtifacts(
  artifacts: FileArtifact[],
  basePath: string = process.cwd()
): Promise<void> {
  try {
    for (const artifact of artifacts) {
      const filePath = path.join(basePath, artifact.path);
      const fileDir = path.dirname(filePath);
      const encoding = artifact.encoding || 'utf-8';

      // Create directory structure if it doesn't exist
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      // Write the file to the filesystem
      fs.writeFileSync(filePath, artifact.content, encoding);
    }
  } catch (error) {
    throw new Error(
      `Failed to apply artifacts to filesystem: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Applies virtual file artifacts to the filesystem asynchronously
 * Creates necessary directories and writes files with the provided content
 * 
 * @param artifacts - Array of file artifacts to apply
 * @param basePath - Base path where files will be written (default: current working directory)
 * @returns Promise that resolves when all files have been written
 * @throws Error if file writing fails
 */
export async function applyArtifactsAsync(
  artifacts: FileArtifact[],
  basePath: string = process.cwd()
): Promise<void> {
  try {
    const promises = artifacts.map(async (artifact) => {
      const filePath = path.join(basePath, artifact.path);
      const fileDir = path.dirname(filePath);
      const encoding = artifact.encoding || 'utf-8';

      // Create directory structure if it doesn't exist
      await fs.promises.mkdir(fileDir, { recursive: true });

      // Write the file to the filesystem
      await fs.promises.writeFile(filePath, artifact.content, encoding);
    });

    await Promise.all(promises);
  } catch (error) {
    throw new Error(
      `Failed to apply artifacts to filesystem: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Validates file artifacts before applying them to the filesystem
 * 
 * @param artifacts - Array of file artifacts to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateArtifacts(artifacts: FileArtifact[]): string[] {
  const errors: string[] = [];

  if (!Array.isArray(artifacts)) {
    errors.push('Artifacts must be an array');
    return errors;
  }

  artifacts.forEach((artifact, index) => {
    if (!artifact.path) {
      errors.push(`Artifact ${index}: path is required`);
    }
    if (typeof artifact.path !== 'string') {
      errors.push(`Artifact ${index}: path must be a string`);
    }
    if (artifact.content === undefined || artifact.content === null) {
      errors.push(`Artifact ${index}: content is required`);
    }
    if (typeof artifact.content !== 'string') {
      errors.push(`Artifact ${index}: content must be a string`);
    }
  });

  return errors;
}

export default {
  applyArtifacts,
  applyArtifactsAsync,
  validateArtifacts,
};
