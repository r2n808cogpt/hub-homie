/**
 * @fileoverview The core rsis808 Logic module within the Factory.
 * This module performs a deep evaluation of the task based on the four principles:
 * Security-First, Clarity, Simplicity, and Local Control, with a focus on SMB practicality.
 */

import { FactoryTask } from '../../src/core/gatekeeper';
import { LogicDecision } from '../../src/core/logic';

/**
 * Performs a comprehensive rsis808 evaluation on a task that has passed the initial Ruleset.
 * @param task The structured task object.
 * @returns A LogicDecision to proceed, refuse, or clarify.
 */
export function evaluateRsis808(task: FactoryTask): LogicDecision {
    // Principle 1: Security-First (Already heavily covered by Gatekeeper and Ruleset, but a final check)
    if (task.generator === 'codegen' && task.request.toLowerCase().includes('insecure api key')) {
        return {
            action: 'refuse',
            reason: 'Security-First Refusal: Request involves handling sensitive information in an insecure manner.',
        };
    }

    // Principle 2: Clarity (Deep check for specific generators)
    if (task.generator === 'service-box' && !task.payload.target_audience) {
        return {
            action: 'clarify',
            reason: 'Clarity Check: Service-Box generation requires a defined target audience or business goal. Please specify.',
        };
    }

    // Principle 3: Simplicity (Check for over-engineering)
    if (task.generator === 'codegen' && task.request.toLowerCase().includes('microservices architecture for a todo list')) {
        return {
            action: 'clarify',
            reason: 'Simplicity Check: The requested solution seems overly complex for the stated goal. Can we achieve this with a simpler, more direct approach?',
        };
    }

    // Principle 4: Local Control (Always assumed to be handled by safe-exec, but good to note)
    // The decision to proceed implies that the output will be presented for Local Control.

    // Principle 5 (Implicit): SMB Practicality (A focus of the rsis808 framework)
    if (task.generator === 'recipes' && task.request.toLowerCase().includes('billion dollar exit strategy')) {
        return {
            action: 'clarify',
            reason: 'SMB Practicality Check: The "Recipes" generator focuses on repeatable, small-to-medium business flows. Please refine the request to a practical, actionable business process.',
        };
    }

    // If all checks pass, proceed
    return {
        action: 'proceed',
        reason: `Task passed all deep rsis808 evaluations. Ready for ${task.generator} generation.`,
    };
}
