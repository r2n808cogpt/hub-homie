# Extending the Castle: Adding New Generators

The Castle Software Factory is designed for modularity, making it straightforward to add new generation capabilities. Every new module must adhere to the **Generator Interface** and respect the **rsis808** principles.

## Generator Interface

All new generators must implement the `Generator` interface defined in `factory/registry.ts`:

\`\`\`typescript
export interface Generator {
    name: string;
    description: string;
    execute: (task: FactoryTask, decision: LogicDecision) => Promise<GenerationResult>;
}
\`\`\`

### Steps to Add a New Generator

1.  **Create the Generator File:**
    Create a new TypeScript file in the `factory/generators/` directory (e.g., `factory/generators/new-generator.ts`).

2.  **Implement the Interface:**
    Define and export a constant that implements the `Generator` interface. The `execute` function contains the core logic for generating the output.

    *   **Safety Note:** Within the `execute` function, ensure that the output is non-executable and that any potential risks are clearly documented in the `GenerationResult`'s `warnings` array.

3.  **Register the Generator:**
    Open `factory/registry.ts` and perform two steps:
    *   Add an `import` statement for your new generator.
    *   Add the generator to the `GENERATOR_REGISTRY` map using its unique name as the key.

    \`\`\`typescript
    // factory/registry.ts
    import { newGenerator } from './generators/new-generator';
    
    export const GENERATOR_REGISTRY: Record<string, Generator> = {
        // ... existing generators
        'new-generator-name': newGenerator, // <-- Add your new generator here
    };
    \`\`\`

4.  **Update Gatekeeper Routing (Optional but Recommended):**
    If you want the `Gatekeeper` (`src/core/gatekeeper.ts`) to automatically route specific user requests to your new generator, update its intent-mapping logic.

5.  **Update rsis808 Logic (Optional but Recommended):**
    If your new generator introduces unique risks or requires specific clarity checks, update the `factory/rsis808/logic.ts` module to include checks specific to your generator's name. This ensures your new module is fully integrated into the safety framework.

## Safe Extension Guidelines

*   **Security-First:** Never introduce external API calls or network access without a dedicated, highly scrutinized module that is explicitly approved by the operator.
*   **Local Control:** The `execute` function must only return data; it must not perform I/O operations (like writing to disk or executing shell commands). The `safe-exec` module handles the final, controlled output presentation.
*   **Clarity:** Use clear, descriptive names for your generator and its internal functions.
*   **Simplicity:** Keep the logic within the `execute` function as simple and focused as possible. Complex, reusable logic should be abstracted into the `factory/gemini/` placeholder modules.
