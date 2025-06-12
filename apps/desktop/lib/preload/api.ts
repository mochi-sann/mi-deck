import { ipcRenderer } from "electron";

const api = {
  // biome-ignore lint/suspicious/noExplicitAny: IPC arguments can be of any type
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  },
  // biome-ignore lint/suspicious/noExplicitAny: IPC callback arguments can be of any type
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args));
  },
  // biome-ignore lint/suspicious/noExplicitAny: IPC arguments can be of any type
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

export default api;
