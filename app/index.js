const { createWindow } = require('./main')
const { app } = require('electron')

require('./database');

app.whenReady().then(createWindow);
app.allowRendererProcessReuse = false 

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})