import { beforeEach } from "vitest";
import { registerScreen } from "../navigate.js";

// jsdom does not implement HTMLDialogElement.show/showModal/close — polyfill them
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.show) {
    HTMLDialogElement.prototype.show = function () {};
  }
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {};
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {};
  }
}

// Register no-op screens so navigate() calls don't throw during binding
const noop = () => {};
registerScreen("render", noop);
registerScreen("setupScreen", noop);
registerScreen("gameScreen", noop);
registerScreen("firstTurnScreen", noop);
registerScreen("unitAssignmentScreen", noop);
registerScreen("opponentTurnScreen", noop);
registerScreen("aboutScreen", noop);
registerScreen("gameOverScreen", noop);

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
