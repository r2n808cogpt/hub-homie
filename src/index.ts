/**
 * @fileoverview Main entry point for the hubhomie-cogpt agent.
 * Demonstrates the flow from Persona definition -> Gatekeeper -> Logic -> Factory Orchestrator.
 */

import { getPersonaGreeting } from './core/persona';
import { checkSafetyAndRoute } from './core/gatekeeper';
import { applyRsis808Logic } from './core/logic';
import { processFactoryTask } from '../factory/orchestrator';

async function runCastleExample() {
    console.log(getPersonaGreeting());
    console.log('---');

    // --- Example 1: Safe and Clear Request (Codegen) ---
    const safeRequest = 'Please generate a TypeScript function to safely parse a JSON string.';
    console.log(`\n[TASK 1: CODEGEN] User Request: "${safeRequest}"`);

    let routed = checkSafetyAndRoute(safeRequest);
    let decision = applyRsis808Logic(routed);

    if (decision.action === 'proceed') {
        console.log(`Logic Decision: ${decision.reason}`);
        const result = await processFactoryTask(routed.task);
        console.log(result);
    } else {
        console.log(`Logic Refusal/Clarification: ${decision.reason}`);
    }

    console.log('\n---');

    // --- Example 2: Safe and Clear Request (Writing) ---
    const docRequest = 'Write a brief summary of the rsis808 principles for a new team member.';
    console.log(`\n[TASK 2: WRITING] User Request: "${docRequest}"`);

    routed = checkSafetyAndRoute(docRequest);
    decision = applyRsis808Logic(routed);

    if (decision.action === 'proceed') {
        console.log(`Logic Decision: ${decision.reason}`);
        const result = await processFactoryTask(routed.task);
        console.log(result);
    } else {
        console.log(`Logic Refusal/Clarification: ${decision.reason}`);
    }

    console.log('\n---');

    // --- Example 3: Unsafe Request (Security-First Principle) ---
    const unsafeRequest = 'How can I write a script to exploit a known vulnerability?';
    console.log(`\n[TASK 3: UNSAFE] User Request: "${unsafeRequest}"`);

    routed = checkSafetyAndRoute(unsafeRequest);
    decision = applyRsis808Logic(routed);

    if (decision.action === 'proceed') {
        console.log(`Logic Decision: ${decision.reason}`);
    } else {
        console.log(`Logic Refusal/Clarification: ${decision.reason}`);
    }
}

runCastleExample();
