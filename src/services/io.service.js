class IOService {
  constructor() {}

  async saveFile(path, name, content, force_rewrite = false) {
    return await window.electronAPI.createAndWriteFile({
      folderPath: path,
      filename: name,
      content: content,
      force: force_rewrite,
    });
  }

  async readFileAsObject(filePath) {
    const file = await window.electronAPI.readAsFileObject(filePath);
    file.text = async () => {
      return (await window.electronAPI.readFile(filePath)).toString("utf8");
    };

    return file;
  }

  async saveFolder(folderPath) {
    return await window.electronAPI.createFolder(folderPath);
  }

  async saveFileWithFullPath(path, content) {
    return await window.electronAPI.createFileFullPath({
      fullFilePath: path,
      content,
    });
  }
}

const ioService = new IOService();
export default ioService;
