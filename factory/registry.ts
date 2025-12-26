/**
 * @fileoverview The Registry module for the Castle Software Factory.
 * It lists all available generators and their metadata, allowing the Orchestrator
 * to dynamically route tasks and verify generator existence.
 */

import { FactoryTask } from '../src/core/gatekeeper';
import { LogicDecision } from '../src/core/logic';

/**
 * The standard interface for all Generator modules in the Factory.
 * All generators must adhere to this for consistent orchestration.
 */
export interface Generator {
    name: string;
    description: string;
    execute: (task: FactoryTask, decision: LogicDecision) => Promise<GenerationResult>;
}

/**
 * The standard result object returned by all Generator executions.
 */
export interface GenerationResult {
    success: boolean;
    output: string;
    files?: { [key: string]: string }; // Map of file path to content
    warnings?: string[];
}

// Placeholder imports for the actual generator implementations
// These will be implemented in Phase 5
import { codegenGenerator } from './generators/codegen';
import { writingGenerator } from './generators/writing';
import { serviceBoxGenerator } from './generators/service-box';
import { workspaceGenerator } from './generators/workspace';
import { brandingGenerator } from './generators/branding';
import { recipesGenerator } from './generators/recipes';

/**
 * The central map of all available generators.
 */
export const GENERATOR_REGISTRY: Record<string, Generator> = {
    'codegen': codegenGenerator,
    'writing': writingGenerator,
    'service-box': serviceBoxGenerator,
    'workspace': workspaceGenerator,
    'branding': brandingGenerator,
    'recipes': recipesGenerator,
    // Add new generators here
};

/**
 * Retrieves a generator by its name.
 * @param name The name of the generator (e.g., 'codegen').
 * @returns The Generator object or undefined if not found.
 */
export function getGenerator(name: string): Generator | undefined {
    return GENERATOR_REGISTRY[name];
}
