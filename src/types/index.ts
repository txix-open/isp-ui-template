export {};

declare global {
  interface Window {
    config: { [key: string]: any };
  }
}
