/**
 * @fileoverview The Safe Execution module for the Castle Software Factory.
 * This module enforces the "Local Control" and "Security-First" rsis808 principles
 * by ensuring that all generated outputs are presented for operator review
 * and that no potentially destructive actions are taken autonomously.
 */

import { GenerationResult } from './registry';

/**
 * Executes the final step of a task, which involves presenting the output
 * and ensuring the user (operator) has local control over the result.
 * 
 * In this foundational version, "execution" means formatting and presenting
 * the generated files and output to the user for manual review and action.
 * 
 * @param result The result object from a Generator.
 * @returns A formatted string for the user, emphasizing local control.
 */
export function safeExecute(result: GenerationResult): string {
    if (!result.success) {
        return `Execution Failed: The generator reported an error. Output: ${result.output}`;
    }

    let message = `\n--- Safe Execution Complete (Local Control Enforced) ---\n`;
    message += `Status: Generation Successful.\n`;
    message += `Summary: ${result.output}\n`;

    if (result.files && Object.keys(result.files).length > 0) {
        message += `\nGenerated Files for Operator Review:\n`;
        for (const [path, content] of Object.entries(result.files)) {
            message += `  - ${path} (${content.length} bytes)\n`;
        }
        message += `\nACTION REQUIRED: Please review the contents of these files before integrating or executing them. The Castle does not execute code autonomously. (Local Control Principle)\n`;
    } else {
        message += `\nNo files were generated. Output is text-based.\n`;
    }

    if (result.warnings && result.warnings.length > 0) {
        message += `\nWARNINGS:\n`;
        result.warnings.forEach(w => message += `  - ${w}\n`);
    }

    message += `\n--- End Safe Execution ---\n`;
    return message;
}
