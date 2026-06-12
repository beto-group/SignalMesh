# Contribution Guidelines — Signal Mesh

Welcome! This component is part of the BetoOS Datacore library. Please adhere to the following architectural standards.

## Codebase Architecture

The module utilizes a split-file structure to guarantee legibility, testability, and isolated execution scopes:

```text
SignalMesh/
├── SIGNAL MESH.md         # Obsidian entry point
├── METADATA.md            # Component manifest
├── README.md              # Documentation
├── CONTRIBUTION.md        # This file
├── LICENSE.md             # MIT license
├── data/
│   └── mcp_commands.json  # Hot reload trigger
├── assets/
│   ├── image/
│   │   └── preview_1.webp  # Static preview image
│   └── videos/
│       └── preview.gif     # Immersive preview clip
└── src/
    ├── index.jsx          # Bootstrapper & reload daemon
    ├── App.jsx            # View coordinator loading dependencies
    ├── components/
    │   └── SignalComponent.jsx # Particle network WebGL visualizer
    ├── styles/
    │   └── styles.jsx     # CSS property bindings
    └── utils/
        ├── domUtils.jsx   # Workspace leaf node locators
        └── LoadScriptUpgrade.js # CDN script local cache manager
```

## Local Development Workflow

1. This component runs locally within the Datacore environment.
2. Ensure you have the `Datacore` plugin active.
3. Make changes in `src/` to modify the rendering logic, shaders, or user interface.
4. Changes will instantly reload in Obsidian via the HMR invalidation polling daemon.

## Coding Style Rules

1. **Standard Function Declarations**: Use standard function syntax (`function Name() {}`) rather than arrow functions for all React components and helper utilities.
2. **Design Harmonization**: Never hardcode colors. Use Obsidian CSS variables (like `var(--background-primary)`, `var(--text-normal)`, etc.) to ensure seamless integration across both light and dark vault themes.
