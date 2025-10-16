import { invoke } from '@tauri-apps/api/core';

export const auth = {
  saveToken: async (token:string) => {
    return await invoke('save_token', { token });
  },
  getToken: async () => {
    return await invoke('get_token');
  }
};

export const keyboard = {
  listenSaveShortcut: async () => {
    return await invoke('listen_save_shortcut');
  }
};
