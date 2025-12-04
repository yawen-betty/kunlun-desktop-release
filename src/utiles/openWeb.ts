import { open } from '@tauri-apps/plugin-shell';

export async function openWeb(url: string) {
  await open(url);
}
