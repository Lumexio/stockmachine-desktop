import { app, autoUpdater, dialog, BrowserWindow } from 'electron';
import { join } from 'node:path';
import squirrelStartup from 'electron-squirrel-startup';
import { updateElectronApp } from 'update-electron-app';

import path from "path";
import fs from "fs";
import https from 'https';

// Set global temporary directory for things like auto update downloads, creating it if it doesn't exist already.
global.tempPath = path.join(app.getPath("temp"), "NTWRK");
if (!fs.existsSync(global.tempPath)) fs.mkdirSync(global.tempPath);

if (squirrelStartup) {
  app.quit();
}

app.setAppUserModelId("com.squirrel.StockMachine.StockMachine");
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
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
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self';",
        ],
      },
    });
  });
};

// Utility function to download files
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest);
      reject(err);
    });
  });
};

app.whenReady().then(() => {

  updateElectronApp();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  const setupUpdater = async () => {
    try {
      const version = app.getVersion();

      const baseUrl = `https://github.com/Lumexio/ps-electron/releases/download/${version}`;

      if (process.platform === 'win32') {
        // Windows specific setup
        const releasesUrl = `${baseUrl}/RELEASES`;
        const nupkgUrl = `${baseUrl}/STOCKMACHINE-${version}-full.nupkg`;

        const releasesPath = path.join(global.tempPath, 'RELEASES');
        const nupkgPath = path.join(global.tempPath, `STOCKMACHINE-${version}-full.nupkg`);

        await Promise.all([
          downloadFile(releasesUrl, releasesPath),
          downloadFile(nupkgUrl, nupkgPath)
        ]);
        autoUpdater.setFeedURL(global.tempPath);
        autoUpdater.checkForUpdates();

        autoUpdater.on('update-available', () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: 'A new version of STOCKMACHINE is available!',
            buttons: ['ok'],
          });
        });
        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
          const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail:
              'A new version has been downloaded. Restart the application to apply the updates.'
          }
          dialog.showMessageBox(dialogOpts).then(() => {
            autoUpdater.quitAndInstall()
          })
        })


      } else if (process.platform === 'darwin') {
        // macOS specific setup
        const feedJson = {
          url: `${baseUrl}/STOCKMACHINE-${version}-mac.zip`,
          name: `${version}`,
          notes: "New version available",
          pub_date: new Date().toISOString()
        };

        const feedPath = path.join(global.tempPath, 'feed.json');
        fs.writeFileSync(feedPath, JSON.stringify(feedJson));

        autoUpdater.setFeedURL(`file://${feedPath}`);
      }



      console.log('Checking for updates from:', global.tempPath);
      autoUpdater.on('update-not-available', () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'No Updates Available',
          message: 'You are running the latest version of STOCKMACHINE!',
          buttons: ['ok'],
        });
      });
    } catch (error) {
      console.error('Failed to setup auto-updater:', error);
    }
  };
  setupUpdater();



});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
