class IOService {
  async saveFileWithFullPath(path, content) {
    return await window.electronAPI.createFileFullPath({
      fullFilePath: path,
      content,
    });
  }
}

const ioService = new IOService();
export default ioService;
