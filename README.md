<div align="center">
  <a name="readme-top"></a>
  <img src="https://raw.githubusercontent.com/beto-group/beto.assets/main/BETO.logo.animated.svg?raw=true" alt="LOGO" width="160">
  <h1 align="center">SIGNAL MESH</h1>
  <h3 align="center">Procedural WebGL Light Flow Grid Engine</h3>
  
  <p align="center">
    <a href="https://github.com/beto-group/SignalMesh/issues">
      <img src="https://img.shields.io/github/issues/beto-group/SignalMesh?color=9333ea&style=flat-square" alt="Issues">
    </a>
    <a href="https://github.com/beto-group/SignalMesh/blob/main/LICENSE.md">
      <img src="https://img.shields.io/github/license/beto-group/SignalMesh?color=fbbf24&style=flat-square" alt="License">
    </a>
    <img src="https://img.shields.io/badge/Datacore-v1.0.0-blue?style=flat-square" alt="Version">
  </p>
</div>

---

Welcome to **Signal Mesh**, a stunning WebGL particle network visualizer for Datacore. It generates a procedural, self-connecting line segments topology within distinct 3D geometry form factors, mapping glowing signals that travel continuously along the wireframe paths using custom GLSL shaders and real-time bloom post-processing.

---

## ⚡ Main Features

* 💎 **Multiple Form Factors**: Procedurally generates connection networks inside customizable shapes (Hexagon, Sphere, Pyramid, Torus, Cube).
* ☄️ **Custom GLSL Shader Flow**: Dynamic vertex/fragment shader maps moving glowing signals along line paths with customizable Flow Speed, Signal Tail length, and Density.
* 🌌 **UnrealBloom Post-Processing**: Epic, real-time glowing bloom overlay customizable in real-time.
* 🎨 **Obsidian Variables Integration**: Automatically matches your active theme colors (Background, Text, Accent) and themes the overlay controls matching Obsidian's dark look.
* ⚙️ **Themed Control Panel**: Standard `lil-gui` panel dynamically styled using CSS variables for standard integration.

---

## 📂 Directory Index

| File | Description |
| :--- | :--- |
| **[`SIGNAL MESH.md`](SIGNAL%20MESH.md)** | The main entry point leaf wrapper designed to mount in Obsidian. |
| **[`src/index.jsx`](src/index.jsx)** | Main bootstrap loader and HMR invalidation polling daemon. |
| **[`src/App.jsx`](src/App.jsx)** | The view coordinator loading dependency modules. |
| **[`src/components/SignalComponent.jsx`](src/components/SignalComponent.jsx)** | The core rendering component with Three.js engine and custom shaders. |
| **[`src/styles/styles.jsx`](src/styles/styles.jsx)** | Layout variables mapped to Obsidian theme CSS properties. |
| **[`src/utils/LoadScriptUpgrade.js`](src/utils/LoadScriptUpgrade.js)** | The canonical CDN caching script loader for Datacore components. |
| **[`src/utils/domUtils.jsx`](src/utils/domUtils.jsx)** | Full-tab helper hooks. |

---

## 🚀 Installation & Mounting

To display this visualizer inside any folder view, create a note file wrapper containing:

```datacorejsx
const activeFile = dc.resolvePath("SIGNAL MESH/src/index.jsx");
const folderPath = activeFile.substring(0, activeFile.lastIndexOf('/src'));
const { View } = await dc.require(activeFile);
return await View({ folderPath, dc });
```

---

## ⚖️ License

This project is licensed under the MIT License — see the [`LICENSE.md`](LICENSE.md) file for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
