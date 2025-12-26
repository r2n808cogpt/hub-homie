/**
 * @fileoverview The Recipes Generator for the Castle Factory.
 * Focuses on generating repeatable business flows and process documentation.
 * Aligns with Clarity and SMB Practicality (part of rsis808 logic).
 */

import { Generator, GenerationResult } from '../registry';
import { FactoryTask } from '../../src/core/gatekeeper';
import { LogicDecision } from '../../src/core/logic';

const recipesGenerator: Generator = {
    name: 'recipes',
    description: 'Generates repeatable business flows and process documentation.',
    execute: async (task: FactoryTask, decision: LogicDecision): Promise<GenerationResult> => {
        // --- Placeholder Logic ---
        console.log(`Executing Recipes for request: ${task.request}`);
        
        const processDoc = `# Business Process Recipe: ${task.request}
// Logic Decision: ${decision.reason}

## Step 1: Define Goal (Clarity)
The goal of this process is to...

## Step 2: Simple Implementation (Simplicity)
Use the most direct tools available. Avoid complex software stacks.

## Step 3: Review and Control (Local Control)
Operator must review and manually execute each step.

// Safe Extension Note:
// Recipes should focus on safe, ethical, and legal business practices.
// NEVER generate recipes for financial fraud, market manipulation, or other
// illegal activities. Security-First principle applies to business processes too.
`;

        return {
            success: true,
            output: 'Business process recipe generated. Review the attached file for the structured flow.',
            files: {
                'recipes/process.md': processDoc,
            },
        };
    },
};

export { recipesGenerator };
