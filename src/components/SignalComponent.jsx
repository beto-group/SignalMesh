/**
 * SignalComponent.jsx — Three.js WebGL and custom GLSL shader particle mesh visualizer.
 * Displays moving light signals inside 3D form factors (Cube, Sphere, Pyramid, Hexagon, Torus).
 * Converted to standard function syntax and themed with Obsidian CSS variables.
 */
function SignalComponent(props) {
    const { dc, loadScript, isFullTab, isInception, onToggleFullTab, styles, onCodeReloadRequest, folderPath } = props;
    const { useState, useEffect, useRef } = dc;

    const canvasContainerRef = useRef(null);
    const guiContainerRef = useRef(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    // --- Singleton Persistence ---
    const refs = useRef({
        scene: null, camera: null, renderer: null, composer: null,
        mesh: null, gui: null, animationId: null, clock: null, controls: null,
        bloomPass: null, material: null,
        THREE: null,
        GUI: null,
        OrbitControls: null,
        EffectComposer: null,
        RenderPass: null,
        UnrealBloomPass: null,
        params: {
            shape: 'Hexagon',
            backgroundColor: '#141414',
            lineColor: '#3c3c3c',
            dotColor: '#a855f7', // Purple flow
            useFog: true,
            fogDensity: 0.025,
            useBloom: true,
            bloomThreshold: 0.05,
            bloomStrength: 1.8,
            bloomRadius: 0.45,
            onlyExternal: true,
            speed: 0.15,
            dotLength: 0.02,
            dotDensity: 2.0
        }
    }).current;

    useEffect(function () {
        let active = true;

        async function init() {
            try {
                // 1. Map ESM dependencies
                let importMap = document.getElementById('three-import-map-signalmesh');
                if (!importMap) {
                    importMap = document.createElement('script');
                    importMap.id = 'three-import-map-signalmesh';
                    importMap.type = 'importmap';
                    importMap.textContent = JSON.stringify({
                        imports: {
                            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                            "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
                        }
                    });
                    document.head.appendChild(importMap);
                }

                await new Promise(function (r) { setTimeout(r, 50); });

                // 2. Load Modules
                const THREE = await loadScript(dc, 'https://unpkg.com/three@0.160.0/build/three.module.js', { type: 'module', globalName: 'THREE', cacheDir: folderPath + '/data/cache/scripts' });
                const { GUI } = await loadScript(dc, 'https://unpkg.com/three@0.160.0/examples/jsm/libs/lil-gui.module.min.js', { type: 'module', cacheDir: folderPath + '/data/cache/scripts' });
                const { OrbitControls } = await loadScript(dc, 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js?external=three', { type: 'module', cacheDir: folderPath + '/data/cache/scripts' });
                const { EffectComposer } = await loadScript(dc, 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js?external=three', { type: 'module', cacheDir: folderPath + '/data/cache/scripts' });
                const { RenderPass } = await loadScript(dc, 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js?external=three', { type: 'module', cacheDir: folderPath + '/data/cache/scripts' });
                const { UnrealBloomPass } = await loadScript(dc, 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js?external=three', { type: 'module', cacheDir: folderPath + '/data/cache/scripts' });

                if (!active) return;
                setIsLoaded(true);
                refs.THREE = THREE;
                refs.GUI = GUI;
                refs.OrbitControls = OrbitControls;
                refs.EffectComposer = EffectComposer;
                refs.RenderPass = RenderPass;
                refs.UnrealBloomPass = UnrealBloomPass;

                const container = canvasContainerRef.current;
                if (!container) return;
                container.innerHTML = '';

                // Read matching background color from Obsidian theme
                const computedStyle = window.getComputedStyle(document.body);
                const obsidianBgHex = computedStyle.getPropertyValue('--background-primary').trim() || '#141414';
                const obsidianTextHex = computedStyle.getPropertyValue('--text-normal').trim() || '#eee';
                const obsidianAccentHex = computedStyle.getPropertyValue('--interactive-accent').trim() || '#a855f7';

                refs.params.backgroundColor = obsidianBgHex;
                refs.params.dotColor = obsidianAccentHex;

                // --- 3. Scene Setup ---
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(refs.params.backgroundColor);
                scene.fog = new THREE.FogExp2(refs.params.backgroundColor, refs.params.fogDensity);
                refs.scene = scene;

                const bounds = container.getBoundingClientRect();
                const aspect = bounds.width / bounds.height;
                const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
                camera.position.set(0, -2, 28);
                refs.camera = camera;

                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(bounds.width, bounds.height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.toneMapping = THREE.ReinhardToneMapping;
                container.appendChild(renderer.domElement);
                refs.renderer = renderer;

                const controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.4;
                refs.controls = controls;

                // --- 4. Post Processing (Bloom) ---
                const renderScene = new RenderPass(scene, camera);

                const bloomPass = new UnrealBloomPass(new THREE.Vector2(bounds.width, bounds.height), 1.5, 0.4, 0.85);
                bloomPass.threshold = refs.params.bloomThreshold;
                bloomPass.strength = refs.params.bloomStrength;
                bloomPass.radius = refs.params.bloomRadius;
                refs.bloomPass = bloomPass;

                const composer = new EffectComposer(renderer);
                composer.addPass(renderScene);
                composer.addPass(bloomPass);
                refs.composer = composer;

                // --- 5. Math & Geometry Logic ---
                function isPointInside(v, shapeType) {
                    const x = v.x, y = v.y, z = v.z;
                    const r = 12; // Base Size

                    switch (shapeType) {
                        case 'Cube':
                            return Math.abs(x) < r && Math.abs(y) < r && Math.abs(z) < r;
                        case 'Sphere':
                            return (x * x + y * y + z * z) < (r * r);
                        case 'Pyramid':
                            if (y < -r || y > r) return false;
                            const scale = (r - y) / (2 * r);
                            const limit = r * 2 * scale;
                            return Math.abs(x) < limit && Math.abs(z) < limit;
                        case 'Hexagon':
                            if (Math.abs(y) > r) return false;
                            const q2 = Math.abs(x);
                            const r2 = Math.abs(z);
                            return (q2 * 0.866 + r2 * 0.5) < r && q2 < r;
                        case 'Torus':
                            const tubeRadius = 4;
                            const mainRadius = 10;
                            const distXZ = Math.sqrt(x * x + z * z) - mainRadius;
                            return (distXZ * distXZ + y * y) < (tubeRadius * tubeRadius);
                        default:
                            return Math.abs(x) < r && Math.abs(y) < r && Math.abs(z) < r;
                    }
                }

                function isSurface(v, shapeType, step) {
                    if (!isPointInside(v, shapeType)) return false;
                    const dirs = [
                        new THREE.Vector3(step, 0, 0), new THREE.Vector3(-step, 0, 0),
                        new THREE.Vector3(0, step, 0), new THREE.Vector3(0, -step, 0),
                        new THREE.Vector3(0, 0, step), new THREE.Vector3(0, 0, -step)
                    ];
                    for (let j = 0; j < dirs.length; j++) {
                        const neighbor = v.clone().add(dirs[j]);
                        if (!isPointInside(neighbor, shapeType)) {
                            return true;
                        }
                    }
                    return false;
                }

                function createShapeGeometry(shapeType, onlyExternal) {
                    const positions = [];
                    const attributes = [];

                    const step = 2;
                    const maxSegments = 6000;

                    let currentPos = new THREE.Vector3(0, 0, 0);
                    let currentDist = 0;

                    function findStartPoint() {
                        let p = new THREE.Vector3();
                        for (let k = 0; k < 200; k++) {
                            p.set(
                                (Math.random() - 0.5) * 26,
                                (Math.random() - 0.5) * 26,
                                (Math.random() - 0.5) * 26
                            ).round().multiplyScalar(1);

                            p.x = Math.round(p.x / step) * step;
                            p.y = Math.round(p.y / step) * step;
                            p.z = Math.round(p.z / step) * step;

                            if (onlyExternal) {
                                if (isSurface(p, shapeType, step)) return p;
                            } else {
                                if (isPointInside(p, shapeType)) return p;
                            }
                        }
                        return new THREE.Vector3(0, 0, 0);
                    }

                    currentPos = findStartPoint();

                    for (let i = 0; i < maxSegments; i++) {
                        const dirs = [
                            new THREE.Vector3(step, 0, 0), new THREE.Vector3(-step, 0, 0),
                            new THREE.Vector3(0, step, 0), new THREE.Vector3(0, -step, 0),
                            new THREE.Vector3(0, 0, step), new THREE.Vector3(0, 0, -step)
                        ];

                        const dirIndex = Math.floor(Math.random() * 6);
                        const direction = dirs[dirIndex];
                        const nextPos = currentPos.clone().add(direction);

                        let isValid = false;

                        if (onlyExternal) {
                            if (isSurface(nextPos, shapeType, step)) isValid = true;
                        } else {
                            if (isPointInside(nextPos, shapeType)) isValid = true;
                        }

                        if (isValid) {
                            positions.push(currentPos.x, currentPos.y, currentPos.z);
                            positions.push(nextPos.x, nextPos.y, nextPos.z);

                            attributes.push(currentDist);
                            attributes.push(currentDist + step);

                            currentDist += step;
                            currentPos.copy(nextPos);
                        } else {
                            currentDist += 50.0;
                            currentPos = findStartPoint();
                        }
                    }

                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                    geometry.setAttribute('lineDistance', new THREE.Float32BufferAttribute(attributes, 1));
                    return geometry;
                }

                // --- 6. Shaders ---
                const vertexShader = [
                    "attribute float lineDistance;",
                    "varying float vDistance;",
                    "void main() {",
                    "    vDistance = lineDistance;",
                    "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                    "}"
                ].join('\n');

                const fragmentShader = [
                    "uniform vec3 colorLine;",
                    "uniform vec3 colorDot;",
                    "uniform float uTime;",
                    "uniform float uSpeed;",
                    "uniform float uDotLength;",
                    "uniform float uDotRepeat;",
                    "uniform vec3 uFogColor;",
                    "uniform float uFogDensity;",
                    "uniform bool uUseFog;",
                    "varying float vDistance;",
                    "void main() {",
                    "    float alpha = 0.15;",
                    "    float distanceState = vDistance - uTime * uSpeed * 10.0;",
                    "    float flow = mod(distanceState, uDotRepeat * 10.0);",
                    "    float lengthVal = (uDotRepeat * 10.0) * uDotLength;",
                    "    float signal = smoothstep((uDotRepeat * 10.0) - lengthVal, (uDotRepeat * 10.0), flow);",
                    "    if(flow < (uDotRepeat * 10.0) - lengthVal) signal = 0.0;",
                    "    vec3 finalColor = mix(colorLine, colorDot, signal);",
                    "    float finalAlpha = max(alpha, signal);",
                    "    gl_FragColor = vec4(finalColor, finalAlpha);",
                    "    if (uUseFog) {",
                    "        float depth = gl_FragCoord.z / gl_FragCoord.w;",
                    "        float fogFactor = exp2(-uFogDensity * uFogDensity * depth * depth * 1.442695);",
                    "        fogFactor = clamp(fogFactor, 0.0, 1.0);",
                    "        gl_FragColor.rgb = mix(uFogColor, gl_FragColor.rgb, fogFactor);",
                    "    }",
                    "}"
                ].join('\n');

                const material = new THREE.ShaderMaterial({
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    uniforms: {
                        colorLine: { value: new THREE.Color(refs.params.lineColor) },
                        colorDot: { value: new THREE.Color(refs.params.dotColor) },
                        uTime: { value: 0 },
                        uSpeed: { value: refs.params.speed },
                        uDotLength: { value: refs.params.dotLength },
                        uDotRepeat: { value: refs.params.dotDensity },
                        uFogColor: { value: new THREE.Color(refs.params.backgroundColor) },
                        uFogDensity: { value: refs.params.fogDensity },
                        uUseFog: { value: refs.params.useFog }
                    },
                    transparent: true,
                    depthTest: false,
                    blending: THREE.AdditiveBlending,
                    side: THREE.DoubleSide
                });
                refs.material = material;

                let mesh = new THREE.LineSegments(createShapeGeometry(refs.params.shape, refs.params.onlyExternal), material);
                scene.add(mesh);
                refs.mesh = mesh;

                // --- 7. GUI ---
                const gui = new GUI({ title: 'System Core', container: guiContainerRef.current });
                refs.gui = gui;
                gui.close();

                function rebuildGeo() {
                    scene.remove(refs.mesh);
                    if (refs.mesh.geometry) refs.mesh.geometry.dispose();
                    const geo = createShapeGeometry(refs.params.shape, refs.params.onlyExternal);
                    refs.mesh = new THREE.LineSegments(geo, refs.material);
                    scene.add(refs.mesh);
                }

                const fGeo = gui.addFolder('Geometry');
                fGeo.add(refs.params, 'shape', ['Cube', 'Sphere', 'Pyramid', 'Hexagon', 'Torus']).name('Form Factor').onChange(rebuildGeo);
                fGeo.add(refs.params, 'onlyExternal').name('Only External').onChange(rebuildGeo);
                fGeo.close();

                const fColors = gui.addFolder('Colors');
                fColors.addColor(refs.params, 'backgroundColor').name('Background').onChange(function (val) {
                    scene.background.set(val);
                    scene.fog.color.set(val);
                    material.uniforms.uFogColor.value.set(val);
                });
                fColors.addColor(refs.params, 'lineColor').name('Wire Color').onChange(function (val) {
                    material.uniforms.colorLine.value.set(val);
                });
                fColors.addColor(refs.params, 'dotColor').name('Signal Color').onChange(function (val) {
                    material.uniforms.colorDot.value.set(val);
                });
                fColors.close();

                const fSignal = gui.addFolder('Signal Props');
                fSignal.add(refs.params, 'speed', 0.1, 2.0).name('Flow Speed').onChange(function (val) {
                    material.uniforms.uSpeed.value = val;
                });
                fSignal.add(refs.params, 'dotLength', 0.01, 0.5).name('Signal Tail').onChange(function (val) {
                    material.uniforms.uDotLength.value = val;
                });
                fSignal.add(refs.params, 'dotDensity', 1.0, 10.0).name('Density (1/Freq)').onChange(function (val) {
                    material.uniforms.uDotRepeat.value = val;
                });
                fSignal.close();

                const fRender = gui.addFolder('Rendering');
                fRender.add(refs.params, 'useFog').name('Fog Enabled').onChange(function (val) {
                    material.uniforms.uUseFog.value = val;
                });
                fRender.add(refs.params, 'fogDensity', 0.0, 0.1).name('Fog Density').onChange(function (val) {
                    scene.fog.density = val;
                    material.uniforms.uFogDensity.value = val;
                });
                fRender.add(refs.params, 'useBloom').name('Bloom Effect');
                fRender.add(refs.params, 'bloomThreshold', 0.0, 1.0).name('Bloom Thresh').onChange(function (val) {
                    bloomPass.threshold = val;
                });
                fRender.add(refs.params, 'bloomStrength', 0.0, 3.0).name('Bloom Strength').onChange(function (val) {
                    bloomPass.strength = val;
                });
                fRender.add(refs.params, 'bloomRadius', 0.0, 1.0).name('Bloom Radius').onChange(function (val) {
                    bloomPass.radius = val;
                });
                fRender.close();

                // --- 8. Event Listeners ---
                function onResize() {
                    if (!container || !refs.renderer || !refs.camera) return;
                    const b = container.getBoundingClientRect();
                    refs.camera.aspect = b.width / b.height;
                    refs.camera.updateProjectionMatrix();
                    refs.renderer.setSize(b.width, b.height);
                    if (refs.composer) refs.composer.setSize(b.width, b.height);
                }
                window.addEventListener('resize', onResize);
                const resizeObserver = new ResizeObserver(onResize);
                resizeObserver.observe(container);

                // --- 9. Render Loop ---
                const clock = new THREE.Clock();
                refs.clock = clock;

                function animate() {
                    refs.animationId = requestAnimationFrame(animate);

                    if (refs.clock && refs.material && refs.controls) {
                        const time = refs.clock.getElapsedTime();
                        refs.material.uniforms.uTime.value = time;
                        refs.controls.update();

                        if (refs.params.useBloom && refs.composer) {
                            refs.composer.render();
                        } else if (refs.renderer && refs.scene && refs.camera) {
                            refs.renderer.render(refs.scene, refs.camera);
                        }
                    }
                }
                animate();

                // Store cleanup listeners to explicit unmount hook function
                refs.cleanupListeners = function () {
                    window.removeEventListener('resize', onResize);
                    resizeObserver.disconnect();
                };

            } catch (e) {
                console.error("SignalComponent Init Error:", e);
                if (active) setError(e.message);
            }
        }

        init();

        return function () {
            active = false;
            if (refs.animationId) cancelAnimationFrame(refs.animationId);
            if (refs.gui) refs.gui.destroy();
            if (refs.cleanupListeners) refs.cleanupListeners();
            if (refs.controls) refs.controls.dispose();

            // Dispose geometries and materials
            try {
                if (refs.mesh) {
                    if (refs.mesh.geometry) refs.mesh.geometry.dispose();
                }
                if (refs.material) refs.material.dispose();

                // Dispose composer passes
                if (refs.composer) {
                    if (refs.composer.renderTarget1) refs.composer.renderTarget1.dispose();
                    if (refs.composer.renderTarget2) refs.composer.renderTarget2.dispose();
                    refs.composer.passes.forEach(function (pass) {
                        if (pass.dispose) pass.dispose();
                    });
                }

                if (refs.renderer) refs.renderer.dispose();
            } catch (e) { console.error("Dispose error", e); }
        };
    }, []);

    return (
        <div style={styles.fullTabWrapper}>
            <style>{`
                .lil-gui {
                    --background-color: var(--background-secondary, #1a1a1a);
                    --text-color: var(--text-normal, #eee);
                    --title-background-color: var(--background-secondary-alt, #0f0f0f);
                    --widget-color: var(--background-modifier-form-field, #2d2d2d);
                    --hover-color: var(--background-modifier-hover, #3e3e3e);
                    --focus-color: var(--interactive-accent, #a855f7);
                    --number-color: var(--text-accent, #a855f7);
                    --string-color: var(--text-success, #22c55e);
                    font-family: var(--font-interface, sans-serif);
                    border-radius: 8px;
                    border: 1px solid var(--background-modifier-border, #333);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
            `}</style>

            {!isLoaded && !error && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    Loading ThreeJS and Addons...
                </div>
            )}

            {error && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-error)', zIndex: 10, padding: '20px', textAlign: 'center' }}>
                    Error loading Component: {error}
                </div>
            )}

            <div ref={canvasContainerRef} style={styles.canvas} />
            <div ref={guiContainerRef} style={styles.guiContainer} />

            {!isInception && (
                <button
                    onClick={onToggleFullTab}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        zIndex: 10,
                        padding: '10px',
                        background: 'var(--background-secondary, rgba(0,0,0,0.6))',
                        border: '1px solid var(--background-modifier-border, #333)',
                        color: 'var(--text-normal, #fff)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={function(e) { e.target.style.background = 'var(--background-modifier-hover)'; }}
                    onMouseLeave={function(e) { e.target.style.background = 'var(--background-secondary, rgba(0,0,0,0.6))'; }}
                >
                    <dc.Icon icon={isFullTab ? "minimize" : "maximize"} size={16} />
                </button>
            )}
        </div>
    );
}

return { SignalComponent };
