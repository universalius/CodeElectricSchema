export const COMPONENTS_STORAGE_KEY = "scheme.components";
export const CONNECTIONS_STORAGE_KEY = "scheme.connections";

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage errors (e.g. private mode / quota exceeded)
  }
}
