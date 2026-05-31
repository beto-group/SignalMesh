---
cssclasses:
  - bfv-container
---

```datacorejsx
// Always resolve the folder path relative to THIS component file,
// not the currently active leaf (which changes with Full Tab mode).
const componentFile = dc.resolvePath("");
const folderPath = componentFile.substring(0, componentFile.lastIndexOf('/'));
console.log("[SignalMesh] Component folderPath resolved as:", folderPath);

const { View } = await dc.require(folderPath + "/src/index.jsx");
return await View({ folderPath, dc });
```
