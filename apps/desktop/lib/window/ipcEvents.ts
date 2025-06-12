import os from "node:os";
import { type BrowserWindow, ipcMain, shell } from "electron";

// biome-ignore lint/suspicious/noExplicitAny: IPC handler arguments can be of any type
const handleIpc = (channel: string, handler: (...args: any[]) => void) => {
  ipcMain.handle(channel, handler);
};

// biome-ignore lint/style/useNamingConvention: IPC is an established acronym
export const registerWindowIPC = (mainWindow: BrowserWindow) => {
  // Hide the menu bar
  mainWindow.setMenuBarVisibility(false);

  // Register window IPC
  handleIpc("init-window", () => {
    const { width, height } = mainWindow.getBounds();
    const minimizable = mainWindow.isMinimizable();
    const maximizable = mainWindow.isMaximizable();
    const platform = os.platform();

    return { width, height, minimizable, maximizable, platform };
  });

  handleIpc("is-window-minimizable", () => mainWindow.isMinimizable());
  handleIpc("is-window-maximizable", () => mainWindow.isMaximizable());
  handleIpc("window-minimize", () => mainWindow.minimize());
  handleIpc("window-maximize", () => mainWindow.maximize());
  handleIpc("window-close", () => mainWindow.close());
  handleIpc("window-maximize-toggle", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  const webContents = mainWindow.webContents;
  handleIpc("web-undo", () => webContents.undo());
  handleIpc("web-redo", () => webContents.redo());
  handleIpc("web-cut", () => webContents.cut());
  handleIpc("web-copy", () => webContents.copy());
  handleIpc("web-paste", () => webContents.paste());
  handleIpc("web-delete", () => webContents.delete());
  handleIpc("web-select-all", () => webContents.selectAll());
  handleIpc("web-reload", () => webContents.reload());
  handleIpc("web-force-reload", () => webContents.reloadIgnoringCache());
  handleIpc("web-toggle-devtools", () => webContents.toggleDevTools());
  handleIpc("web-actual-size", () => webContents.setZoomLevel(0));
  handleIpc("web-zoom-in", () =>
    webContents.setZoomLevel(webContents.zoomLevel + 0.5),
  );
  handleIpc("web-zoom-out", () =>
    webContents.setZoomLevel(webContents.zoomLevel - 0.5),
  );
  handleIpc("web-toggle-fullscreen", () =>
    mainWindow.setFullScreen(!mainWindow.fullScreen),
  );
  handleIpc("web-open-url", (_e, url) => shell.openExternal(url));
};
