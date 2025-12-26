# The rsis808 Principles: Safety and Operator Logic

The **rsis808** framework is the foundational safety and decision-making logic for the Castle Software Factory. It ensures that the `hubhomie-cogpt` agent operates as a secure, reliable, and operator-friendly tool, fully compliant with Microsoft Copilot safety guidelines.

## The Four Core Principles

| Principle | Description | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Security-First** | All decisions prioritize safety, ethical guidelines, and data security over convenience or speed. | **Gatekeeper** (initial refusal), **Ruleset** (high-risk checks), and **Deep Logic** (final refusal). |
| **Clarity** | The user's request, the agent's understanding, and the proposed action must be unambiguous. | **Deep Logic** checks for vague requests and may return a `clarify` decision, requiring more detail from the operator. |
| **Simplicity** | The agent favors the simplest, most direct, and most maintainable solution or code structure. | **Deep Logic** checks for over-engineering (e.g., complex architecture for simple tasks) and guides Generator design. |
| **Local Control** | The operator (user) maintains ultimate control over the final execution of any generated output. | **Safe-Exec** module ensures all generated assets are presented for manual review and approval; no autonomous execution is permitted. |

## Decision Flow in the rsis808 Modules

The decision-making process is layered to ensure rapid refusal of unsafe requests and careful evaluation of complex ones:

### 1. Gatekeeper Safety Check (Immediate Refusal)
The `Gatekeeper` performs a keyword and intent analysis. Any request that directly violates the core persona boundaries (e.g., illegal, harmful, or self-harm content) is immediately flagged and refused. This is the first line of defense for the **Security-First** principle.

### 2. Ruleset Check (Pre-Routing Filter)
The `Ruleset` (`factory/rsis808/ruleset.ts`) applies quick, high-level heuristics. It is designed to catch common issues like overly short requests (violating **Clarity**) or known high-risk combinations (violating **Security-First**) before committing to a full generation process.

### 3. Deep Logic Evaluation (Comprehensive Review)
The `Deep Logic` (`factory/rsis808/logic.ts`) performs the most thorough evaluation. It checks for:
*   **SMB Practicality:** Is the request relevant and practical for a small-to-medium business context? (Implicit in rsis808).
*   **Simplicity Violations:** Is the proposed solution unnecessarily complex?
*   **Clarity Gaps:** Are all necessary parameters present for the selected Generator?

Only after passing all three layers of the rsis808 framework is the task allowed to proceed to the **Orchestrator** for generation.

## Alignment with Microsoft Copilot Safety Guidelines

The entire rsis808 framework is an internal implementation of standard AI safety protocols. The agent is hard-coded to:
*   **Refuse Harmful Content:** Enforced by the Gatekeeper and Security-First principle.
*   **Avoid Professional Advice:** Enforced by the Persona's boundaries.
*   **Ensure Transparency:** Enforced by the Clarity principle and the detailed output from the Safe-Exec module.
*   **Prevent Autonomous Action:** Enforced by the Local Control principle via the Safe-Exec module.
