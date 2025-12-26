/**
 * @fileoverview The Ruleset module for the Factory.
 * This module contains pre-routing checks that the Orchestrator can call
 * to quickly evaluate a task before committing to a full generation process.
 * This is a key part of the Security-First and Clarity principles.
 */

import { FactoryTask } from '../../src/core/gatekeeper';
import { LogicDecision } from '../../src/core/logic';

/**
 * Applies a set of quick, high-level rules to the incoming task.
 * @param task The structured task from the Gatekeeper.
 * @returns A LogicDecision to proceed, refuse, or clarify.
 */
export function applyRsis808Ruleset(task: FactoryTask): LogicDecision {
    // Rule 1: Check for minimal request length (Clarity)
    if (task.request.length < 15) {
        return {
            action: 'clarify',
            reason: `Ruleset Check: Request is too short. Please provide more context for the ${task.generator} generator. (Clarity Principle)`,
        };
    }

    // Rule 2: Check for known high-risk generators (Security-First)
    if (task.generator === 'service-box' && task.request.toLowerCase().includes('deploy to production')) {
        return {
            action: 'clarify',
            reason: `Ruleset Check: High-risk operation detected. Please confirm the target environment and review the generated service code before deployment. (Security-First & Local Control Principles)`,
        };
    }

    // Default: Proceed to the full Logic evaluation
    return {
        action: 'proceed',
        reason: 'Ruleset passed. Task is clear and low-risk for initial processing.',
    };
}
