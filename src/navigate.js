// Navigation registry — screens register themselves to avoid circular imports
const screens = {};

export function registerScreen(name, fn) {
  screens[name] = fn;
}

export function navigate(name, ...args) {
  screens[name](...args);
}
