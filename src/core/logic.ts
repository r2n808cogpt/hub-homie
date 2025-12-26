/**
 * @fileoverview The Logic module for hubhomie-cogpt.
 * This module enforces safe, operator-friendly decision-making inspired by the
 * "rsis808" principles: Security-First, Clarity, Simplicity, and Local Control.
 */

import { RoutedRequest } from './gatekeeper';
import { FactoryTask } from './gatekeeper'; // Import FactoryTask
import { evaluateRsis808 } from '../factory/rsis808/logic'; // Import the deep logic
import { applyRsis808Ruleset } from '../factory/rsis808/ruleset';
import { applyRsis808Ruleset } from '../factory/rsis808/ruleset'; // Placeholder for new ruleset integration

export interface LogicDecision {
    action: 'proceed' | 'refuse' | 'clarify';
    reason: string;
    details?: any;
}

/**
 * Enforces the "rsis808" principles on a routed request before execution.
 * 
 * rsis808 Principles:
 * 1. Security-First: Always prioritize safety and security over convenience.
 * 2. Clarity: Ensure the request and the proposed action are unambiguous.
 * 3. Simplicity: Favor the simplest, most direct solution.
 * 4. Local Control: Ensure the user maintains control over the final execution.
 * 
 * @param routedRequest The request object from the Gatekeeper.
 * @returns A LogicDecision object.
 */
export function applyRsis808Logic(routedRequest: RoutedRequest): LogicDecision {
    // Step 1: Apply pre-routing ruleset from the factory
    const rulesetDecision = applyRsis808Ruleset(routedRequest.task);
    if (rulesetDecision.action !== 'proceed') {
        return rulesetDecision;
    }

    // Step 2: Apply deep rsis808 logic
    const deepLogicDecision = evaluateRsis808(routedRequest.task);
    if (deepLogicDecision.action !== 'proceed') {
        return deepLogicDecision;
    }
    if (!routedRequest.isSafe) {
        // Principle 1: Security-First
        return {
            action: 'refuse',
            reason: `Refused by Security-First principle: ${routedRequest.safetyMessage}`,
        };
    }

    // Principle 4: Local Control is always enforced by the safe-exec module.
    
    return {
        action: 'proceed',
        reason: `Request passed Gatekeeper, Ruleset, and Deep Logic. Delegating to Factory Orchestrator for execution.`,
    };
}
