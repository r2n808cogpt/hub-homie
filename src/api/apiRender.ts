import fs from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

/**
 * Represents a generated artifact to be rendered
 */
export interface Artifact {
  id: string;
  filename: string;
  content: string;
  filepath?: string;
  metadata?: Record<string, any>;
}

/**
 * Represents a file that was successfully applied
 */
export interface AppliedFile {
  path: string;
  filename: string;
  success: boolean;
  message?: string;
  error?: string;
  bytesWritten?: number;
}

/**
 * Represents the render operation status and results
 */
export interface RenderStatus {
  success: boolean;
  timestamp: string;
  totalArtifacts: number;
  appliedFiles: AppliedFile[];
  failedFiles: AppliedFile[];
  summary: {
    successful: number;
    failed: number;
    totalBytesWritten: number;
  };
  errors: string[];
}

/**
 * Configuration for the render operation
 */
export interface RenderConfig {
  baseOutputPath?: string;
  createDirectories?: boolean;
  overwriteExisting?: boolean;
  preserveStructure?: boolean;
}

/**
 * Default render configuration
 */
const DEFAULT_CONFIG: RenderConfig = {
  baseOutputPath: process.cwd(),
  createDirectories: true,
  overwriteExisting: true,
  preserveStructure: true,
};

/**
 * Validates artifact structure and content
 */
function validateArtifact(artifact: Artifact): { valid: boolean; error?: string } {
  if (!artifact.id) {
    return { valid: false, error: 'Artifact must have an id' };
  }
  if (!artifact.filename) {
    return { valid: false, error: 'Artifact must have a filename' };
  }
  if (artifact.content === null || artifact.content === undefined) {
    return { valid: false, error: 'Artifact must have content' };
  }
  return { valid: true };
}

/**
 * Resolves the final file path based on artifact configuration
 */
function resolveFilePath(
  artifact: Artifact,
  baseOutputPath: string,
  preserveStructure: boolean
): string {
  if (artifact.filepath) {
    return path.join(baseOutputPath, artifact.filepath);
  }

  if (preserveStructure && artifact.metadata?.sourceDir) {
    return path.join(baseOutputPath, artifact.metadata.sourceDir, artifact.filename);
  }

  return path.join(baseOutputPath, artifact.filename);
}

/**
 * Writes a single artifact to the filesystem
 */
async function writeArtifactToFile(
  artifact: Artifact,
  outputPath: string,
  config: RenderConfig
): Promise<AppliedFile> {
  try {
    // Validate artifact
    const validation = validateArtifact(artifact);
    if (!validation.valid) {
      return {
        path: outputPath,
        filename: artifact.filename,
        success: false,
        error: validation.error,
      };
    }

    // Check if file exists
    if (!config.overwriteExisting) {
      try {
        await fs.access(outputPath);
        return {
          path: outputPath,
          filename: artifact.filename,
          success: false,
          error: 'File already exists and overwrite is disabled',
        };
      } catch {
        // File doesn't exist, proceed
      }
    }

    // Create parent directories if needed
    if (config.createDirectories) {
      const dirPath = path.dirname(outputPath);
      try {
        await mkdir(dirPath, { recursive: true });
      } catch (err) {
        return {
          path: outputPath,
          filename: artifact.filename,
          success: false,
          error: `Failed to create directory: ${(err as Error).message}`,
        };
      }
    }

    // Write file content
    const contentBuffer = Buffer.from(artifact.content, 'utf-8');
    await fs.writeFile(outputPath, contentBuffer, 'utf-8');

    return {
      path: outputPath,
      filename: artifact.filename,
      success: true,
      message: `Successfully written to ${outputPath}`,
      bytesWritten: contentBuffer.length,
    };
  } catch (error) {
    return {
      path: outputPath,
      filename: artifact.filename,
      success: false,
      error: `Error writing file: ${(error as Error).message}`,
    };
  }
}

/**
 * Main API render function that processes artifacts and writes them to filesystem
 * @param artifacts - Array of artifacts to render
 * @param config - Optional render configuration
 * @returns RenderStatus with operation results
 */
export async function apiRender(
  artifacts: Artifact[],
  config?: Partial<RenderConfig>
): Promise<RenderStatus> {
  const startTime = new Date();
  const mergedConfig: RenderConfig = { ...DEFAULT_CONFIG, ...config };
  const appliedFiles: AppliedFile[] = [];
  const failedFiles: AppliedFile[] = [];
  const errors: string[] = [];

  // Validate input
  if (!Array.isArray(artifacts)) {
    return {
      success: false,
      timestamp: startTime.toISOString(),
      totalArtifacts: 0,
      appliedFiles: [],
      failedFiles: [],
      summary: { successful: 0, failed: 0, totalBytesWritten: 0 },
      errors: ['Artifacts must be an array'],
    };
  }

  if (artifacts.length === 0) {
    return {
      success: false,
      timestamp: startTime.toISOString(),
      totalArtifacts: 0,
      appliedFiles: [],
      failedFiles: [],
      summary: { successful: 0, failed: 0, totalBytesWritten: 0 },
      errors: ['No artifacts provided to render'],
    };
  }

  // Validate base output path exists or can be created
  try {
    if (mergedConfig.createDirectories) {
      await mkdir(mergedConfig.baseOutputPath!, { recursive: true });
    } else {
      await fs.access(mergedConfig.baseOutputPath!);
    }
  } catch (err) {
    const errorMsg = `Failed to access or create output path: ${(err as Error).message}`;
    errors.push(errorMsg);
    return {
      success: false,
      timestamp: startTime.toISOString(),
      totalArtifacts: artifacts.length,
      appliedFiles: [],
      failedFiles: [],
      summary: { successful: 0, failed: 0, totalBytesWritten: 0 },
      errors,
    };
  }

  // Process each artifact
  for (const artifact of artifacts) {
    const outputPath = resolveFilePath(
      artifact,
      mergedConfig.baseOutputPath!,
      mergedConfig.preserveStructure!
    );

    const result = await writeArtifactToFile(artifact, outputPath, mergedConfig);

    if (result.success) {
      appliedFiles.push(result);
    } else {
      failedFiles.push(result);
      if (result.error) {
        errors.push(`[${artifact.id}] ${result.error}`);
      }
    }
  }

  // Calculate summary statistics
  const totalBytesWritten = appliedFiles.reduce((sum, file) => sum + (file.bytesWritten || 0), 0);

  const renderStatus: RenderStatus = {
    success: failedFiles.length === 0,
    timestamp: startTime.toISOString(),
    totalArtifacts: artifacts.length,
    appliedFiles,
    failedFiles,
    summary: {
      successful: appliedFiles.length,
      failed: failedFiles.length,
      totalBytesWritten,
    },
    errors,
  };

  return renderStatus;
}

/**
 * Renders artifacts with file grouping by directory
 * @param artifacts - Array of artifacts to render
 * @param outputDirectory - Target output directory
 * @returns RenderStatus with detailed results
 */
export async function apiRenderToDirectory(
  artifacts: Artifact[],
  outputDirectory: string
): Promise<RenderStatus> {
  return apiRender(artifacts, {
    baseOutputPath: outputDirectory,
    createDirectories: true,
    overwriteExisting: true,
    preserveStructure: true,
  });
}

/**
 * Renders a single artifact
 * @param artifact - Single artifact to render
 * @param outputPath - Full output path for the file
 * @returns RenderStatus with single file result
 */
export async function apiRenderSingleFile(
  artifact: Artifact,
  outputPath: string
): Promise<RenderStatus> {
  const startTime = new Date();
  const validation = validateArtifact(artifact);

  if (!validation.valid) {
    return {
      success: false,
      timestamp: startTime.toISOString(),
      totalArtifacts: 1,
      appliedFiles: [],
      failedFiles: [
        {
          path: outputPath,
          filename: artifact.filename,
          success: false,
          error: validation.error,
        },
      ],
      summary: { successful: 0, failed: 1, totalBytesWritten: 0 },
      errors: [validation.error || 'Validation failed'],
    };
  }

  try {
    const dirPath = path.dirname(outputPath);
    await mkdir(dirPath, { recursive: true });
    const contentBuffer = Buffer.from(artifact.content, 'utf-8');
    await fs.writeFile(outputPath, contentBuffer, 'utf-8');

    return {
      success: true,
      timestamp: startTime.toISOString(),
      totalArtifacts: 1,
      appliedFiles: [
        {
          path: outputPath,
          filename: artifact.filename,
          success: true,
          message: `Successfully written to ${outputPath}`,
          bytesWritten: contentBuffer.length,
        },
      ],
      failedFiles: [],
      summary: { successful: 1, failed: 0, totalBytesWritten: contentBuffer.length },
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      timestamp: startTime.toISOString(),
      totalArtifacts: 1,
      appliedFiles: [],
      failedFiles: [
        {
          path: outputPath,
          filename: artifact.filename,
          success: false,
          error: `Error writing file: ${(error as Error).message}`,
        },
      ],
      summary: { successful: 0, failed: 1, totalBytesWritten: 0 },
      errors: [`Failed to write ${artifact.filename}: ${(error as Error).message}`],
    };
  }
}

export default apiRender;
