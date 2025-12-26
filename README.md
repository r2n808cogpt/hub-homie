# hubhomie-cogpt: The Castle Software Factory

## Overview

**hubhomie-cogpt** has been expanded into the **Castle Software Factory**, a comprehensive, modular system designed to be a secure and supportive partner for software development, documentation, and structured workflow management.

The entire architecture is built upon the **rsis808** principles and strictly adheres to **Microsoft Copilot safety guidelines**, ensuring that all generated outputs are operator-safe, security-first, and presented for **Local Control**.

## Core Principles: The "rsis808" Framework

The Castle's decision-making is governed by the four **rsis808** principles:

| Principle | Focus | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Security-First** | Prioritize safety, ethics, and security over convenience. | Enforced by the Gatekeeper and the layered rsis808 logic (Ruleset + Deep Logic). |
| **Clarity** | Ensure the request and the proposed action are unambiguous. | Deep Logic evaluates requests for vagueness and may trigger a `clarify` decision. |
| **Simplicity** | Favor the simplest, most direct, and most maintainable solution. | Deep Logic checks for over-engineering, guiding Generators toward practical SMB solutions. |
| **Local Control** | The operator maintains ultimate control over final execution. | Enforced by the **Safe-Exec** module, which only presents results for manual review. |

## Castle Architecture and Interaction Flow

The system is divided into two main areas: the **Core** (the agent interface) and the **Factory** (the production engine).

### 1. The Core (`src/core/`) - The Agent Interface

The `hubhomie-cogpt` agent acts as the central interface:

*   **Persona:** Defines the agent's identity, tone, and non-negotiable safety boundaries.
*   **Gatekeeper:** Performs the initial safety check and converts the user's natural language request into a structured `FactoryTask`.
*   **Logic:** Orchestrates the layered `rsis808` evaluation (Ruleset and Deep Logic) to determine if the task is safe and clear enough to proceed.

### 2. The Factory (`factory/`) - The Production Engine

If the task is approved by the Core Logic, it is routed to the Factory:

*   **Orchestrator:** Receives the approved task and manages the execution flow.
*   **Registry:** Provides the Orchestrator with a dynamic list of all available **Generators** (e.g., `codegen`, `writing`, `service-box`).
*   **Generators:** The production units that create the final output. The starter generators include:
    *   `codegen`: Scaffolds, refactors, explanations.
    *   `writing`: Documentation, summaries, structured content.
    *   `service-box`: SMB service templates.
    *   `workspace`: Multi-file project builder.
    *   `branding`: Themes and naming helpers.
    *   `recipes`: Repeatable business flows.
*   **Safe-Exec:** The final step. It takes the Generator's output and formats it for operator review, explicitly preventing autonomous execution to enforce **Local Control**.

## How to Safely Extend the System

The modular design allows for easy expansion, provided the safety framework is respected.

1.  **Add a New Generator:** Create a new file in `factory/generators/` that implements the `Generator` interface.
2.  **Register:** Add the new generator to the `GENERATOR_REGISTRY` in `factory/registry.ts`.
3.  **Integrate Safety:** Update the `factory/rsis808/logic.ts` to include specific clarity or risk checks for your new generator.

For detailed instructions on adding new modules, see the documentation: `factory/docs/extending-generators.md`.

## Getting Started

1.  **Clone the repository:**
    \`\`\`bash
    gh repo clone r2n808cogpt/hub-homie
    cd hub-homie
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    pnpm install
    \`\`\`
3.  **Run the example flow:**
    \`\`\`bash
    pnpm start
    \`\`\`
    This will execute the example in `src/index.ts`, demonstrating the full flow from Gatekeeper to Safe-Exec.
