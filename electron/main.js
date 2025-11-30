// electron/main.js
import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import * as mime from 'mime-types';
// Fix __dirname in ESM
import { fileURLToPath } from 'url';
import {
  createCipheriv,
  createDecipheriv,
  scryptSync,
  randomBytes,
} from 'crypto';
import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  lstatSync,
  readdirSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../app.config.json');
const configRaw = readFileSync(configPath, 'utf8');
const config = JSON.parse(configRaw);

const isDevelopment = config.environment === 'development';

// Security constants – keep these secret!
const ALGORITHM = 'aes-256-gcm';
const SALT = 'your-unique-salt-123!'; // Should be fixed
const PASSWORD = 'your-strong-secret-password'; // Embed securely (see note below)
const KEY = scryptSync(PASSWORD, SALT, 32); // 256-bit key

// 📁 Define folder and file path
const userDataPath = app.getPath('userData');
const projectsDir = join(userDataPath, 'projects'); // <user-data>/projects/

// Ensure the 'projects' folder exists
if (!existsSync(projectsDir)) {
  mkdirSync(projectsDir, { recursive: true });
}

// ... rest of your main logic (same as before, but with imports)
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    icon: path.join(__dirname, '../dist/ico.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
    },
  });

  if (isDevelopment) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 🔒 Encryption & decryption (same as before)
function encryptObject(obj) {
  const iv = randomBytes(16);
  const data = JSON.stringify(obj);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  cipher.setAAD(Buffer.from('metadata'));
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
}

function decryptObject(payload) {
  const { iv, authTag, encryptedData } = payload;
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
  decipher.setAAD(Buffer.from('metadata'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = decipher.update(
    Buffer.from(encryptedData, 'hex'),
    null,
    'utf8'
  );
  decipher.final();
  return JSON.parse(decrypted);
}

function scanDir(dirPath) {
  const items = [];

  function walk(currentPath) {
    const stat = lstatSync(currentPath);
    const name = path.basename(currentPath);
    const item = {
      type: stat.isDirectory() ? 'folder' : 'file',
      name,
      path: currentPath,
    };
    items.push(item);

    if (stat.isDirectory()) {
      const children = readdirSync(currentPath);
      for (const child of children) {
        walk(path.join(currentPath, child));
      }
    }
  }

  walk(dirPath);
  return items;
}

// IPC handler for reading a file
ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    throw err;
  }
});

// Optional: list files in a directory
ipcMain.handle('file:readdir', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (err) {
    throw err;
  }
});

// Handle folder selection securely
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:openFile', async (event, options = {}) => {
  const result = await dialog.showOpenDialog({
    ...options,
    properties: options.properties || ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Project & Translation Files',
        extensions: ['json', 'prj'],
      },
    ],
  });
  return result;
});

ipcMain.handle(
  'file:createAndWrite',
  async (event, { folderPath, filename, content, force = false }) => {
    try {
      // 1. Create the folder (recursively, if needed)
      await fs.mkdir(folderPath, { recursive: true });

      // 2. Build full file path
      const filePath = path.join(folderPath, filename);

      if (existsSync(filePath) && !force) return filePath;

      // 3. Write content to file
      await fs.writeFile(filePath, content, 'utf8');

      return filePath;
    } catch (error) {
      console.error('Failed to create/write file:', error);
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle('file:delete', (event, filePath) => {
  try {
    unlinkSync(path.resolve(filePath));
  } catch (err) {
    console.error('File delete error:', err);
    throw err;
  }
});

ipcMain.handle(
  'file:createFullPath',
  async (event, { fullFilePath, content }) => {
    try {
      // Resolve and normalize the path (helps prevent some path traversal issues)
      const resolvedPath = path.resolve(fullFilePath);

      // Extract the directory part
      const dir = path.dirname(resolvedPath);

      // Create the directory recursively if it doesn't exist
      mkdirSync(dir, { recursive: true });

      // Write the file (overwrites if it exists)
      writeFileSync(resolvedPath, content);
      return fullFilePath;
    } catch (error) {
      console.error('Failed to create/write file:', error);
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle('folder:create', async (event, folderPath) => {
  try {
    if (existsSync(folderPath)) return folderPath;
    await fs.mkdir(folderPath, { recursive: true });
    return folderPath;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('path:join', async (event, part1, part2) => {
  const p = path.join(part1, part2);
  try {
    return p;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:readAsFileObject', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const buffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const mimeType = mime.lookup(fileName) || 'application/octet-stream';

    // Return a File-like plain object
    return {
      name: fileName,
      size: stats.size,
      type: mimeType,
      lastModifiedDate: new Date(stats.mtimeMs), // milliseconds (matches File.lastModified)
      content: buffer.toString('utf8'),
      // If you need binary, send as base64 or use IPC-safe Buffer (Electron 28+)
      // rawBuffer: buffer, // ⚠️ Buffers are transferable but large ones degrade perf
    };
  } catch (error) {
    console.error('Failed to read file:', error);
    throw error;
  }
});

ipcMain.handle('project:save', (event, data, filename) => {
  try {
    const encrypted = encryptObject(data);
    const DATA_FILE = join(projectsDir, filename);
    writeFileSync(DATA_FILE, JSON.stringify(encrypted, null, 2)); // pretty-print optional
    return { success: true };
  } catch (err) {
    console.error('Save failed:', err);
    throw err;
  }
});

ipcMain.handle('project:load', (event, filename) => {
  try {
    const DATA_FILE = filename;
    if (!existsSync(DATA_FILE)) return null;
    const raw = readFileSync(DATA_FILE, 'utf8');
    const payload = JSON.parse(raw);
    return decryptObject(payload);
  } catch (err) {
    console.error('Load failed (corrupted or tampered):', err);
    throw new Error('Data file is invalid');
  }
});

ipcMain.handle('project:scan', (event) => {
  try {
    if (!existsSync(projectsDir)) {
      throw new Error('Path does not exist');
    }
    return scanDir(projectsDir);
  } catch (err) {
    console.error('Scan error:', err);
    throw err;
  }
});

ipcMain.handle('project:delete', (event, filePath) => {
  try {
    if (!existsSync(projectsDir)) {
      throw new Error('Path does not exist');
    }
    unlinkSync(path.resolve(path.join(projectsDir, filePath)));
  } catch (err) {
    console.error('File delete error:', err);
    throw err;
  }
});

ipcMain.handle('folder:scan', (event, folderPath) => {
  try {
    if (!existsSync(folderPath)) {
      throw new Error('Path does not exist');
    }
    return scanDir(folderPath);
  } catch (err) {
    console.error('Scan error:', err);
    throw err;
  }
});
