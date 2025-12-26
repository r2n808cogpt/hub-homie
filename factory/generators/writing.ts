/**
 * @fileoverview The Writing Generator for the Castle Factory.
 * Focuses on generating documentation, summaries, and structured content.
 * Aligns with Clarity rsis808 principle.
 */

import { Generator, GenerationResult } from '../registry';
import { FactoryTask } from '../../src/core/gatekeeper';
import { LogicDecision } from '../../src/core/logic';

const writingGenerator: Generator = {
    name: 'writing',
    description: 'Generates documentation, summaries, and structured content.',
    execute: async (task: FactoryTask, decision: LogicDecision): Promise<GenerationResult> => {
        // --- Placeholder Logic ---
        console.log(`Executing Writing for request: ${task.request}`);
        
        const generatedDoc = `# Generated Document: ${task.request}

## Clarity Principle Enforcement
This document is structured for maximum clarity and readability.

### Summary of Request
*   **Source Request:** ${task.request}
*   **Logic Decision:** ${decision.reason}

### Content Placeholder
This is the generated content. When expanding this generator, ensure the output
is well-structured (e.g., Markdown, JSON, YAML) and avoids ambiguity.

// Safe Extension Note:
// The writing generator should never produce content that violates the persona's
// boundaries. Always check the output against the Security-First principle,
// especially when generating policy or security-related documentation.
`;

        return {
            success: true,
            output: 'Documentation generated. Review the attached file.',
            files: {
                'docs/generated/content.md': generatedDoc,
            },
        };
    },
};

export { writingGenerator };
