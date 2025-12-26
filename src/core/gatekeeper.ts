/**
 * @fileoverview The Gatekeeper module for hubhomie-cogpt.
 * Its primary function is to perform an initial safety check on user requests
 * and route the request to the appropriate internal function based on intent.
 */

import { HUBHOMIE_PERSONA } from './persona';

// Interface for the task object passed to the Factory Orchestrator
export interface FactoryTask {
    id: string;
    request: string;
    intent: 'factory_task' | 'unsafe' | 'general';
    generator: string; // e.g., 'codegen', 'writing', 'service-box'
    payload: Record<string, any>; // Structured data for the generator
}

export type RequestIntent = 'factory_task' | 'general' | 'unsafe'; // Simplified intent for routing to the factory orchestrator

export interface RoutedRequest {
    // The gatekeeper now prepares a task object for the factory orchestrator
    task: FactoryTask;
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
                task: {
                    id: Date.now().toString(),
                    request: request,
                    intent: 'unsafe',
                    generator: 'none',
                    payload: {},
                }
            };
            };
        }
    }

    // --- Phase 2: Intent Routing to Factory Orchestrator ---
    // In a real implementation, an LLM would parse the request into a structured FactoryTask.
    // For this foundational structure, we'll create a simple task and route it.
    
    // Simple intent mapping for placeholder
    let generatorName = 'writing';
    if (lowerRequest.includes('code') || lowerRequest.includes('implement') || lowerRequest.includes('bug')) {
        generatorName = 'codegen';
    } else if (lowerRequest.includes('service') || lowerRequest.includes('smb')) {
        generatorName = 'service-box';
    }

    const factoryTask: FactoryTask = {
        id: Date.now().toString(),
        request: request.trim(),
        intent: 'factory_task',
        generator: generatorName,
        payload: {
            // Placeholder for structured data extracted from the request
        },
    };

    return {
        isSafe: true,
        intent: 'factory_task',
        sanitizedRequest: request.trim(), // Simple sanitization
        task: factoryTask,
    };
}
