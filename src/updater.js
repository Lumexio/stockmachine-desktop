import { app, dialog } from 'electron';
import { updateElectronApp } from 'update-electron-app';

export function initAutoUpdater() {
 const options = {
  repository: 'Lumexio/ps-electron',    // Updated with your actual repo
  updateInterval: '1 hour',
  logger: {
   info: (...args) => console.log(...args),
   error: (...args) => console.error(...args)
  },
  notifyUser: true
 };

 // Initialize updater
 updateElectronApp({
  ...options,
  onUpdateChecking: () => {
   console.log('Checking for updates from GitHub...');
  },
  onUpdateAvailable: (info) => {
   dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available. Downloading now...',
    detail: `Version ${info.version} is available from GitHub.`
   });
  },
  onUpdateDownloaded: (info) => {
   dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'Update Downloaded',
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
   }).then((returnValue) => {
    if (returnValue.response === 0) {
     app.relaunch();
     app.quit();
    }
   });
  },
  onUpdateError: (err) => {
   console.error('Error during update:', err);
   dialog.showErrorBox(
    'Update Error',
    'An error occurred while updating the application.'
   );
  }
 });
}
