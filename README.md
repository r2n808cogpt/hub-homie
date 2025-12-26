# hubhomie-cogpt: Foundational AI Agent

## Overview

**hubhomie-cogpt** is a foundational, modular AI agent designed to serve as a secure and supportive assistant for software development, documentation generation, and structured workflow management. Inspired by the principles of **Microsoft Copilot's safety guidelines**, this agent is built from the ground up to be a reliable, non-authoritative partner that prioritizes user safety and control.

The agent's architecture is designed for modularity, allowing for easy expansion and integration of new generation capabilities.

## Core Principles: The "rsis808" Framework

The decision-making process of \`hubhomie-cogpt\` is governed by the "rsis808" principles, which ensure that all actions are operator-friendly and security-conscious:

| Principle | Description | Implementation Focus |
| :--- | :--- | :--- |
| **Security-First** | Always prioritize safety, ethical guidelines, and security over convenience or speed. | Enforced by the \`Gatekeeper\` and \`Logic\` modules. Refuses any request that violates core safety boundaries. |
| **Clarity** | Ensure the user's request and the agent's proposed action are unambiguous and well-defined. | The \`Logic\` module may request clarification for vague or overly broad prompts. |
| **Simplicity** | Favor the simplest, most direct, and most maintainable solution or code structure. | Guides the design of generated code and documentation templates. |
| **Local Control** | The user maintains ultimate control over the final execution of any generated code or workflow. | Generated code is presented for review; the agent will not execute potentially destructive commands autonomously. |

## Architecture and Modules

The agent is structured into four primary, modular components written in TypeScript:

### 1. Persona (\`src/core/persona.ts\`)

This module defines the agent's identity, purpose, and tone. It explicitly lists the **boundaries** and **safety guidelines** that the agent must adhere to, ensuring compliance with standard AI safety protocols.

### 2. Gatekeeper (\`src/core/gatekeeper.ts\`)

The first point of contact for any user request. The \`Gatekeeper\` performs two critical functions:
*   **Initial Safety Check:** Scans the request for immediate violations of the persona's boundaries (e.g., harmful keywords).
*   **Intent Routing:** Determines the user's primary intent (e.g., \`coding\`, \`writing\`, \`workflow\`) to route the request to the correct internal function.

### 3. Logic (\`src/core/logic.ts\`)

The core decision-making engine. The \`Logic\` module applies the **rsis808 principles** to the routed request. It decides whether to:
*   **Proceed:** The request is safe, clear, and ready for generation.
*   **Refuse:** The request violates the Security-First principle.
*   **Clarify:** The request lacks sufficient detail (Clarity principle).

### 4. Generator (\`src/generators/generator.ts\`)

This module houses the functions responsible for creating the final output. It is designed to be easily expanded with new capabilities, such as:
*   \`generateCode()\`: For creating secure, simple code snippets and project structures.
*   \`generateDocumentation()\`: For creating clear and comprehensive project documentation (e.g., READMEs, API docs).
*   *Future Expansion:* Template generation, service scaffolding, etc.

## Safety and Limitations

**hubhomie-cogpt** is a tool to assist and accelerate development, not a replacement for human judgment.

*   **Non-Authoritative:** The agent will never claim to be a substitute for professional advice (legal, medical, security, etc.).
*   **No Unsafe Actions:** The agent is hard-coded to refuse any request that violates its core safety boundaries.
*   **Review Required:** All generated code and proposed workflows **MUST** be reviewed by the user before execution. The agent is designed to support **Local Control**.

## Getting Started

To use and expand this foundational agent:

1.  **Clone the repository:**
    \`\`\`bash
    gh repo clone r2n808cogpt/hub-homie
    cd hub-homie
    \`\`\`
2.  **Install dependencies** (assuming a Node.js/TypeScript environment):
    \`\`\`bash
    # This step will be added in the next phase
    \`\`\`
3.  **Explore the core logic** in the \`src/core/\` directory to understand the safety and decision-making framework.
4.  **Expand the Generator** in \`src/generators/generator.ts\` to add new capabilities.
