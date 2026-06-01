/**
 * App.jsx — Coordinator for SIGNAL MESH.
 * Loads all modules and handles modular mounting.
 */
function App(props) {
    const { folderPath, dc, isFullTab, isInception, onToggleFullTab } = props;
    const { useState, useEffect, useRef } = dc;

    const [modules, setModules] = useState(null);
    const [error, setError] = useState(null);

    const containerRef = useRef(null);
    const stateRefs = useRef({}).current;

    function findNearestAncestorWithClass(element, className) {
        if (!element) return null;
        let current = element.parentNode;
        while (current) {
            if (current.classList && current.classList.contains(className)) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }

    function findDirectChildByClass(parent, className) {
        if (!parent) return null;
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            if (child.classList && child.classList.contains(className)) {
                return child;
            }
        }
        return null;
    }

    useEffect(function () {
        async function loadModules() {
            try {
                const [stylesModule, componentModule, loadScriptModule] = await Promise.all([
                    dc.require(folderPath + "/src/styles/styles.jsx"),
                    dc.require(folderPath + "/src/components/SignalComponent.jsx"),
                    dc.require(folderPath + "/src/utils/LoadScriptUpgrade.js")
                ]);

                // Initialize LoadScriptUpgrade
                const { loadScript } = loadScriptModule;

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

    // DOM Reparenting for Full-tab Mode
    useEffect(function () {
        if (!isFullTab || isInception || !modules) return;

        const container = containerRef.current;
        if (!container) return;

        const targetPaneContent = findNearestAncestorWithClass(container, "workspace-leaf-content");
        if (!targetPaneContent) return;

        const contentWrapper = findDirectChildByClass(targetPaneContent, "view-content") || targetPaneContent;
        const currentParent = container.parentNode;
        if (!currentParent) return;

        // Create placeholder
        stateRefs.originalParent = currentParent;
        const placeholder = document.createElement("div");
        placeholder.className = "screen-mode-placeholder";
        placeholder.style.display = "none";

        if (container.nextSibling) {
            currentParent.insertBefore(placeholder, container.nextSibling);
        } else {
            currentParent.appendChild(placeholder);
        }
        stateRefs.placeholder = placeholder;

        // Position logic
        stateRefs.parentPositionInfo = {
            element: contentWrapper,
            originalInlinePosition: contentWrapper.style.position,
        };

        if (window.getComputedStyle(contentWrapper).position === 'static') {
            contentWrapper.style.position = "relative";
        }

        contentWrapper.appendChild(container);

        // Edge-to-edge styling
        requestAnimationFrame(function () {
            Object.assign(contentWrapper.style, {
                padding: "0",
                margin: "0",
                height: "100%",
                width: "100%",
                display: "block",
                overflow: "hidden",
                minHeight: "0"
            });
        });

        Object.assign(container.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: "9998",
            overflow: "hidden",
            backgroundColor: "var(--background-primary)",
        });

        return function () {
            console.log("Datacore: Cleaning up Full Tab Mode (SignalMesh App)");
            if (stateRefs.placeholder?.parentNode) {
                stateRefs.placeholder.parentNode.replaceChild(container, stateRefs.placeholder);
            } else if (stateRefs.originalParent) {
                stateRefs.originalParent.appendChild(container);
            }

            if (stateRefs.parentPositionInfo?.element) {
                const { element, originalInlinePosition } = stateRefs.parentPositionInfo;
                element.style.position = originalInlinePosition || '';
            }
            container.removeAttribute("style");
        };
    }, [isFullTab, isInception, !!modules]);

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
        <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: 'var(--background-primary)', overflow: 'hidden' }}>
            <SignalComponent
                dc={dc}
                loadScript={loadScript}
                isFullTab={isFullTab}
                isInception={isInception}
                onToggleFullTab={onToggleFullTab}
                styles={STYLES}
                folderPath={folderPath}
                {...props}
            />
        </div>
    );
}

return { App };
