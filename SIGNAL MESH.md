---
cssclasses:
  - bfv-container
---

```datacorejsx
const activeFile = dc.resolvePath("_RESOURCES/DATACORE/_DONE/SIGNAL MESH/src/index.jsx");
const folderPath = activeFile.substring(0, activeFile.lastIndexOf('/src'));
console.log("[SignalMesh] Component folderPath absolute resolved as:", folderPath);

const { View } = await dc.require(activeFile);
return await View({ folderPath, dc });
```
