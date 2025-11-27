const mockElectronAPI = {
  saveData: jest.fn(),
  loadData: jest.fn(),
  deleteProject: jest.fn(),
  scanProject: jest.fn(),
  openFolderDialog: jest.fn(),
  pathJoin: (a, b) => `${a}/${b}`,
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});