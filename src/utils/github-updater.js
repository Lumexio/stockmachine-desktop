import { app, dialog, shell } from 'electron';
async function checkForUpdates() {
  try {
    const response = await fetch('https://api.github.com/repos/Lumexio/stockmachine-desktop/releases/latest', {
      headers: { 'User-Agent': 'stockmachine-desktop-updater' }
    });
    
    if (!response.ok) return;

    const data = await response.json();
    const latestVersion = data.tag_name?.replace('v', '');
    const currentVersion = app.getVersion();

    // Simple semver compare (assumes x.y.z format)
    if (latestVersion && isNewerVersion(currentVersion, latestVersion)) {
      const result = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Download Update', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update Available',
        message: 'A new version of Stock Machine is available!',
        detail: `Version ${latestVersion} is available (you have ${currentVersion}). Would you like to download it now?`
      });

      if (result.response === 0) {
        shell.openExternal(data.html_url);
      }
    }
  } catch (err) {
    console.error('Failed to check for updates:', err);
  }
}

function isNewerVersion(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if ((latestParts[i] || 0) > (currentParts[i] || 0)) return true;
    if ((latestParts[i] || 0) < (currentParts[i] || 0)) return false;
  }
  return false;
}

export { checkForUpdates };
