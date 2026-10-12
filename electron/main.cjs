const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const {autoUpdater} = require('electron-updater')

const isDev = !app.isPackaged

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'Finance App',
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    //Загружаем собранную веб-версию
    if (isDev) {
        win.loadURL('http://localhost:5173')
        win.webContents.openDevTools()
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'Exit', role: 'quit'}
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo'},
                { role: 'redo'},
                { type: 'separator'},
                { role: 'cut'},
                { role: 'copy'},
                { role: 'paste'},
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload'},
                { role: 'toggleDevTools'},
                { type: 'separator'},
                { role: 'togglefullscreen'}
            ]
        }
    ])
    Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
    createWindow()

    //Автообновление (только в production)
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify()
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})