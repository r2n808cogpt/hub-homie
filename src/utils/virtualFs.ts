/**
 * Virtual File System Utilities
 * 
 * This module provides utilities for managing virtual file operations,
 * including applying artifacts to write files.
 * 
 * Created: 2025-12-26 07:08:25 UTC
 */

/**
 * Represents a file artifact to be written to the file system
 */
interface FileArtifact {
  path: string;
  content: string;
  encoding?: BufferEncoding;
}

/**
 * Represents a collection of artifacts to be applied
 */
interface ArtifactsRecord {
  [key: string]: FileArtifact | string;
}

/**
 * Applies artifacts by writing files to the virtual file system
 * 
 * @param artifacts - Record of artifacts to apply, where each value can be either:
 *   - A FileArtifact object with path, content, and optional encoding
 *   - A string representing the file content (path derived from key)
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * const artifacts = {
 *   'config': {
 *     path: 'src/config.ts',
 *     content: 'export const config = {...}'
 *   },
 *   'readme': 'This is the README content'
 * };
 * 
 * await applyArtifacts(artifacts);
 * ```
 */
export async function applyArtifacts(artifacts: ArtifactsRecord): Promise<void> {
  if (!artifacts || typeof artifacts !== 'object') {
    throw new Error('Artifacts must be a valid object');
  }

  const filesToWrite: Array<{ path: string; content: string; encoding: BufferEncoding }> = [];

  // Process each artifact
  for (const [key, value] of Object.entries(artifacts)) {
    let filePath: string;
    let content: string;
    let encoding: BufferEncoding = 'utf-8';

    if (typeof value === 'string') {
      // If value is a string, use it as content and derive path from key
      filePath = value.startsWith('/') ? value : `./${key}`;
      content = value;
    } else if (value && typeof value === 'object' && 'path' in value && 'content' in value) {
      // If value is a FileArtifact object
      filePath = (value as FileArtifact).path;
      content = (value as FileArtifact).content;
      encoding = (value as FileArtifact).encoding || 'utf-8';
    } else {
      console.warn(`Skipping invalid artifact for key: ${key}`);
      continue;
    }

    filesToWrite.push({
      path: filePath,
      content,
      encoding,
    });
  }

  // Write all files
  for (const file of filesToWrite) {
    await writeFile(file.path, file.content, file.encoding);
  }
}

/**
 * Writes a single file to the virtual file system
 * 
 * @param path - File path
 * @param content - File content
 * @param encoding - File encoding (default: 'utf-8')
 * @returns Promise<void>
 */
async function writeFile(
  path: string,
  content: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<void> {
  try {
    // Implementation depends on the runtime environment
    // For Node.js environment:
    if (typeof window === 'undefined') {
      const fs = await import('fs').then(m => m.promises);
      const dir = path.substring(0, path.lastIndexOf('/'));
      
      if (dir) {
        await fs.mkdir(dir, { recursive: true });
      }
      
      await fs.writeFile(path, content, encoding);
    } else {
      // For browser environment, you might use IndexedDB or local storage
      console.log(`Virtual file write: ${path}`);
    }
  } catch (error) {
    throw new Error(`Failed to write file ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Applies artifacts with error handling and logging
 * 
 * @param artifacts - Record of artifacts to apply
 * @param options - Configuration options
 * @returns Promise with result status
 */
export async function applyArtifactsWithLogging(
  artifacts: ArtifactsRecord,
  options?: { verbose?: boolean; dryRun?: boolean }
): Promise<{ success: boolean; filesWritten: number; errors: string[] }> {
  const errors: string[] = [];
  let filesWritten = 0;

  try {
    if (options?.verbose) {
      console.log(`Applying ${Object.keys(artifacts).length} artifacts...`);
    }

    if (!options?.dryRun) {
      await applyArtifacts(artifacts);
      filesWritten = Object.keys(artifacts).length;
    } else if (options?.verbose) {
      console.log('DRY RUN: No files were actually written');
      filesWritten = Object.keys(artifacts).length;
    }

    if (options?.verbose) {
      console.log(`Successfully wrote ${filesWritten} files`);
    }

    return { success: true, filesWritten, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);
    console.error(`Error applying artifacts: ${errorMessage}`);
    return { success: false, filesWritten, errors };
  }
}

export type { FileArtifact, ArtifactsRecord };
