import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'node:path';
import squirrelStartup from 'electron-squirrel-startup';
import { updateElectronApp, UpdateSourceType } from 'update-electron-app';

updateElectronApp({
  updateSource: {
    repo: 'Lumexio/ps-electron',
    type: UpdateSourceType.ElectronPublicUpdateService,
  },
  updateInterval: '5 minutes',
});

if (squirrelStartup) {
  app.quit();
}

// Suppress GPU/VSync errors on Linux
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-software-rasterizer');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.stripe.com; connect-src 'self' https://api.stripe.com https://api.stockmachine.online http://165.227.205.129:8080 http://localhost:3000 https://*.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://*.stripe.com; font-src 'self' data: https://fonts.gstatic.com;",
          ],
        },
      });
    },
  );
};

ipcMain.on('toMain', (_event, data) => {
  if (data?.type === 'openExternal' && typeof data.url === 'string') {
    const url = data.url;
    // Only allow http/https URLs to prevent shell injection
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url);
    }
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
