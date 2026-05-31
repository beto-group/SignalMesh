/**
 * App.jsx — Coordinator for SIGNAL MESH.
 * Loads all modules and handles modular mounting.
 */
function App(props) {
    const { folderPath, dc, isFullTab, isInception, onToggleFullTab } = props;
    const { useState, useEffect } = dc;

    const [modules, setModules] = useState(null);
    const [error, setError] = useState(null);

    useEffect(function () {
        async function loadModules() {
            try {
                const [stylesModule, componentModule, loadScriptModule] = await Promise.all([
                    dc.require(folderPath + "/src/styles/styles.jsx"),
                    dc.require(folderPath + "/src/components/SignalComponent.jsx"),
                    dc.require(folderPath + "/src/utils/LoadScriptUpgrade.js")
                ]);

                // Initialize LoadScriptUpgrade
                const { getLoader } = loadScriptModule;
                const { loadScript } = getLoader(folderPath);

                setModules({
                    STYLES: stylesModule.STYLES,
                    SignalComponent: componentModule.SignalComponent,
                    loadScript: loadScript
                });
            } catch (e) {
                console.error("Signal Mesh: Module loading failed:", e);
                setError(e);
            }
        }
        loadModules();
    }, [folderPath]);

    if (error) {
        return (
            <div style={{ color: "var(--text-error, #ef4444)", padding: "20px", fontFamily: "monospace", background: "var(--background-primary)", height: "100%" }}>
                <h3>Failed to load Signal Mesh modules:</h3>
                <pre style={{ fontSize: "12px" }}>{error.stack || error.message}</pre>
            </div>
        );
    }

    if (!modules) {
        return (
            <div style={{ padding: "40px", color: "var(--text-muted)", fontFamily: "monospace", background: "var(--background-primary)", height: "100%" }}>
                Initializing Signal Mesh...
            </div>
        );
    }

    const { STYLES, SignalComponent, loadScript } = modules;

    return (
        <SignalComponent
            dc={dc}
            loadScript={loadScript}
            isFullTab={isFullTab}
            isInception={isInception}
            onToggleFullTab={onToggleFullTab}
            styles={STYLES}
            {...props}
        />
    );
}

return { App };
