/**
 * @fileoverview The Orchestrator module for the Castle Software Factory.
 * It receives tasks from the Gatekeeper, applies the rsis808 logic,
 * and routes the task to the appropriate Generator for execution.
 */

import { FactoryTask } from '../src/core/gatekeeper';
import { applyRsis808Logic, LogicDecision } from '../src/core/logic';
import { getGenerator, GenerationResult } from './registry';
import { safeExecute } from './safe-exec';

/**
 * The main function to process a task through the Castle Factory.
 * @param task The structured task object from the Gatekeeper.
 * @returns A promise that resolves to the final, safe execution output string.
 */
export async function processFactoryTask(task: FactoryTask): Promise<string> {
    // 1. Apply full rsis808 Logic (includes Ruleset check)
    const logicDecision: LogicDecision = applyRsis808Logic({
        isSafe: task.intent !== 'unsafe', // Assume Gatekeeper did initial safety check
        intent: task.intent,
        sanitizedRequest: task.request,
        task: task,
    });

    if (logicDecision.action !== 'proceed') {
        return `Task Refused/Clarified by rsis808 Logic:\nAction: ${logicDecision.action}\nReason: ${logicDecision.reason}`;
    }

    // 2. Retrieve Generator from Registry
    const generator = getGenerator(task.generator);
    if (!generator) {
        return `Task Refused: Generator '${task.generator}' not found in the Registry.`;
    }

    // 3. Execute Generator
    let generationResult: GenerationResult;
    try {
        // The generator's execute function is expected to be synchronous or return a Promise
        generationResult = await generator.execute(task, logicDecision);
    } catch (error) {
        generationResult = {
            success: false,
            output: `Generator execution failed with an internal error: ${error instanceof Error ? error.message : String(error)}`,
        };
    }

    // 4. Safe Execution (Local Control Enforcement)
    return safeExecute(generationResult);
}
