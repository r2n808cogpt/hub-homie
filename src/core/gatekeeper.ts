/**
 * @fileoverview The Gatekeeper module for hubhomie-cogpt.
 * Its primary function is to perform an initial safety check on user requests
 * and route the request to the appropriate internal function based on intent.
 */

import { HUBHOMIE_PERSONA } from './persona';

export type RequestIntent = 'coding' | 'writing' | 'workflow' | 'general' | 'unsafe';

export interface RoutedRequest {
    isSafe: boolean;
    intent: RequestIntent;
    sanitizedRequest: string;
    safetyMessage?: string;
}

/**
 * Analyzes a user request for safety and determines the primary intent.
 * @param request The raw user input string.
 * @returns A RoutedRequest object with safety status and intent.
 */
export function checkSafetyAndRoute(request: string): RoutedRequest {
    // --- Phase 1: Basic Safety Check ---
    const lowerRequest = request.toLowerCase();
    const unsafeKeywords = ['harm', 'illegal', 'exploit', 'malware', 'self-destruct'];

    for (const keyword of unsafeKeywords) {
        if (lowerRequest.includes(keyword)) {
            return {
                isSafe: false,
                intent: 'unsafe',
                sanitizedRequest: request,
                safetyMessage: `Request flagged: Violates core safety boundary. ${HUBHOMIE_PERSONA.name} cannot process requests related to harmful or illegal activities.`,
            };
        }
    }

    // --- Phase 2: Intent Routing (Placeholder Logic) ---
    let intent: RequestIntent = 'general';

    if (lowerRequest.includes('code') || lowerRequest.includes('implement') || lowerRequest.includes('bug')) {
        intent = 'coding';
    } else if (lowerRequest.includes('write') || lowerRequest.includes('document') || lowerRequest.includes('readme')) {
        intent = 'writing';
    } else if (lowerRequest.includes('workflow') || lowerRequest.includes('process') || lowerRequest.includes('automate')) {
        intent = 'workflow';
    }

    return {
        isSafe: true,
        intent: intent,
        sanitizedRequest: request.trim(), // Simple sanitization
    };
}
