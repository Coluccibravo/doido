import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1044,
    height: 650,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#353DAB',
      symbolColor: 'white',
      height: 30
    },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: false,   // libera integração
      nodeIntegration: true,     // permite require no renderer
      sandbox: false,            // desativa sandbox
      webSecurity: false,        // desliga CSP e CORS no chromium
      allowRunningInsecureContent: true
    }
  })

  // --- Remove completamente qualquer CSP ---
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders

    // Deleta cabeçalhos relacionados a CSP
    delete headers['content-security-policy']
    delete headers['Content-Security-Policy']
    delete headers['x-content-security-policy']
    delete headers['X-Content-Security-Policy']
    delete headers['x-webkit-csp']
    delete headers['X-WebKit-CSP']

    callback({ cancel: false, responseHeaders: headers })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Carregando renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  ipcMain.on('fetch-data', async (event) => {
    try {
      const response = await axios.get('https://catfact.ninja/fact')
      event.reply('fetch-data-response', response.data)
    } catch (error) {
      console.error(error)
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})