/**
 * @fileoverview The Logic module for hubhomie-cogpt.
 * This module enforces safe, operator-friendly decision-making inspired by the
 * "rsis808" principles: Security-First, Clarity, Simplicity, and Local Control.
 */

import { RoutedRequest } from './gatekeeper';

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
    if (!routedRequest.isSafe) {
        // Principle 1: Security-First
        return {
            action: 'refuse',
            reason: `Refused by Security-First principle: ${routedRequest.safetyMessage}`,
        };
    }

    // Example: Check for Clarity
    if (routedRequest.intent === 'general' && routedRequest.sanitizedRequest.length < 10) {
        // Principle 2: Clarity
        return {
            action: 'clarify',
            reason: 'Request is too vague. Please provide more detail to ensure clarity before proceeding.',
        };
    }

    // Example: Enforcing Local Control for 'coding' intent
    if (routedRequest.intent === 'coding') {
        // Principle 4: Local Control
        return {
            action: 'proceed',
            reason: 'Proceeding with coding task. The generated code will be presented for your review and local execution.',
            details: {
                note: 'Remember to always review and execute generated code in a controlled environment.',
            }
        };
    }

    // Default to proceeding for other safe, clear requests
    // Principle 3: Simplicity is applied by favoring direct execution when safe and clear.
    return {
        action: 'proceed',
        reason: `Request is safe and clear. Proceeding with ${routedRequest.intent} task.`,
    };
}
