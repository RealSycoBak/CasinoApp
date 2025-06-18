import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { app, BrowserWindow } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

if (!isDev) {
  const apiPath = path.join(__dirname, 'dist', 'api', 'index.js');
  const apiUrl  = pathToFileURL(apiPath).href;
  import(apiUrl)
    .then(() => console.log('✅ API loaded'))
    .catch(err => console.error('API failed to load:', err));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true, 
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);