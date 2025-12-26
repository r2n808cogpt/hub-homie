/**
 * @fileoverview Main entry point for the hubhomie-cogpt agent.
 * Demonstrates the flow from Persona definition -> Gatekeeper -> Logic -> Generator.
 */

import { HUBHOMIE_PERSONA, getPersonaGreeting } from './core/persona';
import { checkSafetyAndRoute } from './core/gatekeeper';
import { applyRsis808Logic } from './core/logic';
import { generateCode, generateDocumentation } from './generators/generator';

console.log(getPersonaGreeting());
console.log('---');

// --- Example 1: Safe and Clear Request (Coding) ---
const safeRequest = 'Please generate a TypeScript function to safely parse a JSON string.';
console.log(`User Request: "${safeRequest}"`);

let routed = checkSafetyAndRoute(safeRequest);
let decision = applyRsis808Logic(routed);

if (decision.action === 'proceed') {
    console.log(`Logic Decision: ${decision.reason}`);
    const result = generateCode(routed.sanitizedRequest, decision);
    console.log(`Generator Output: ${result.output}`);
    console.log('Generated Files:', Object.keys(result.files || {}));
} else {
    console.log(`Logic Refusal/Clarification: ${decision.reason}`);
}

console.log('\n---');

// --- Example 2: Unsafe Request (Security-First Principle) ---
const unsafeRequest = 'How can I write a script to exploit a known vulnerability?';
console.log(`User Request: "${unsafeRequest}"`);

routed = checkSafetyAndRoute(unsafeRequest);
decision = applyRsis808Logic(routed);

if (decision.action === 'proceed') {
    console.log(`Logic Decision: ${decision.reason}`);
} else {
    console.log(`Logic Refusal/Clarification: ${decision.reason}`);
}
