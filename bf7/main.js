const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow(){
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#0a0d08',
    title: '战地7：1940',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.on('before-input-event', (e, input) => {
    if(input.type === 'keyDown' && input.key === 'F11'){
      e.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });
  return win;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
