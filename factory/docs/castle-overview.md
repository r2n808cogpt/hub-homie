# Castle Software Factory Overview

The **Castle Software Factory** is the comprehensive, modular system built around the `hubhomie-cogpt` central agent. It is designed to provide a secure, operator-controlled environment for generating software, documentation, and business process recipes. The entire architecture is predicated on the **rsis808** principles to ensure safety, clarity, and local control.

## Architecture Flow

The Castle operates on a clear, linear flow from user request to safe, reviewable output:

1.  **User Request:** The operator submits a request to the `hubhomie-cogpt` agent.
2.  **Gatekeeper (`src/core/gatekeeper.ts`):** Performs an initial, immediate safety check against the core persona boundaries (e.g., Microsoft Copilot safety guidelines). If unsafe, the request is immediately refused. If safe, it is converted into a structured `FactoryTask`.
3.  **Core Logic (`src/core/logic.ts`):** The task is passed to the core logic, which orchestrates the `rsis808` evaluation:
    *   **Ruleset Check (`factory/rsis808/ruleset.ts`):** A quick, high-level check for clarity and obvious risk.
    *   **Deep Logic Check (`factory/rsis808/logic.ts`):** A comprehensive evaluation against all four **rsis808** principles (Security-First, Clarity, Simplicity, Local Control, and SMB Practicality).
4.  **Orchestrator (`factory/orchestrator.ts`):** If the task is approved, the Orchestrator takes over.
    *   It consults the **Registry** (`factory/registry.ts`) to locate the correct **Generator** (e.g., `codegen`, `writing`).
    *   It executes the Generator's `execute` function, passing the task and the final logic decision.
5.  **Generator Execution (`factory/generators/*`):** The selected Generator produces the requested output (code, documentation, etc.).
6.  **Safe Execution (`factory/safe-exec.ts`):** The final output is routed through the `safe-exec` module, which enforces the **Local Control** principle by formatting the result for operator review. **No code is executed autonomously.** The operator must manually review and deploy the generated assets.

## Key Modules

| Module | Location | Role in the Castle |
| :--- | :--- | :--- |
| **hubhomie-cogpt** | `src/core/` | The central agent persona and initial routing layer. |
| **Orchestrator** | `factory/orchestrator.ts` | Manages the flow of tasks through the factory. |
| **Registry** | `factory/registry.ts` | A dynamic list of all available Generators and their interfaces. |
| **rsis808** | `factory/rsis808/` | The entire safety and decision-making framework. |
| **Generators** | `factory/generators/` | The production units that create the final assets. |
| **Safe-Exec** | `factory/safe-exec.ts` | The final gate that enforces the **Local Control** principle. |
| **Gemini Placeholder** | `factory/gemini/` | Placeholder for complex, local, deterministic tooling interfaces. |
