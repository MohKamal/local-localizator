class IOService {
  async saveFileWithFullPath(path, content) {
    return await window.electronAPI.createFileFullPath({
      fullFilePath: path,
      content,
    });
  }

  async openFileDialog() {
    return await window.electronAPI.openFile();
  }
}

const ioService = new IOService();
export default ioService;
