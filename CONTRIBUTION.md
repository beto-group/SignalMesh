# Contribution Guidelines

We welcome contributions to this Datacore component!

## Local Development Workflow

1. This component runs locally within the Datacore environment.
2. Ensure you have the `Datacore` plugin active.
3. Make changes in `src/` to modify the rendering logic, shaders, or user interface.
4. Changes will instantly reload in Obsidian via the HMR invalidation polling daemon.

## Coding Style Rules

1. **Standard Function Declarations**: Use standard function syntax (`function Name() {}`) rather than arrow functions for all React components and helper utilities.
2. **Design Harmonization**: Never hardcode colors. Use Obsidian CSS variables (like `var(--background-primary)`, `var(--text-normal)`, etc.) to ensure seamless integration across both light and dark vault themes.
