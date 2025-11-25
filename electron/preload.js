const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (filePath) => ipcRenderer.invoke("file:read", filePath),
  deleteFile: (filePath) => ipcRenderer.invoke("file:delete", filePath),
  readDir: (dirPath) => ipcRenderer.invoke("file:readdir", dirPath),
  openFolderDialog: () => ipcRenderer.invoke("dialog:openFolder"),
  createFolder: (folderPath) => ipcRenderer.invoke("folder:create", folderPath),
  createFileFullPath: (options) =>
    ipcRenderer.invoke("file:createFullPath", options),
  pathJoin: (part1, part2) => ipcRenderer.invoke("path:join", part1, part2),
  readAsFileObject: (filePath) =>
    ipcRenderer.invoke("file:readAsFileObject", filePath),
  createAndWriteFile: (options) =>
    ipcRenderer.invoke("file:createAndWrite", options),
  saveData: (data, filename) =>
    ipcRenderer.invoke("project:save", data, filename),
  loadData: (filename) => ipcRenderer.invoke("project:load", filename),
  scanProject: () => ipcRenderer.invoke("project:scan"),
  deleteProject: (filePath) => ipcRenderer.invoke("project:delete", filePath),
  scanFolder: (folderPath) => ipcRenderer.invoke("folder:scan", folderPath),
});
