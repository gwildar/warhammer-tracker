import { beforeEach } from "vitest";
import { registerScreen } from "../navigate.js";

// Register no-op screens so navigate() calls don't throw during binding
const noop = () => {};
registerScreen("render", noop);
registerScreen("setupScreen", noop);
registerScreen("gameScreen", noop);
registerScreen("firstTurnScreen", noop);
registerScreen("opponentTurnScreen", noop);
registerScreen("aboutScreen", noop);

// Create the #app div before any screen modules are imported
// (they grab document.getElementById('app') at module level)
if (!document.getElementById("app")) {
  const app = document.createElement("div");
  app.id = "app";
  document.body.appendChild(app);
}

beforeEach(() => {
  // Clear the app div
  document.getElementById("app").innerHTML = "";
  // Clear localStorage
  localStorage.clear();
});
