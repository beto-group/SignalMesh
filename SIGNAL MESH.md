---
cssclasses:
  - bfv-container
---

```datacorejsx
const activeFile = "_RESOURCES/DATACORE/_DONE/SIGNAL MESH/src/index.jsx";
const folderPath = "_RESOURCES/DATACORE/_DONE/SIGNAL MESH";
console.log("[SignalMesh] Component folderPath absolute resolved as:", folderPath);

const { View } = await dc.require(activeFile);
return await View({ folderPath, dc });
```
