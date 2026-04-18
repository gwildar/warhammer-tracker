import { clearAll } from "./state.js";

export function showErrorOverlay(err) {
  const existing = document.getElementById("error-overlay");
  if (existing) existing.remove();

  const message =
    err?.message || String(err) || "An unexpected error occurred.";

  const overlay = document.createElement("div");
  overlay.id = "error-overlay";
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:1rem;";

  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #444;border-radius:0.5rem;padding:1.5rem;max-width:28rem;width:100%;text-align:center;color:#e5e7eb;">
      <h2 style="font-size:1.125rem;font-weight:700;margin-bottom:0.75rem;color:#f87171;">Something went wrong</h2>
      <p style="font-size:0.875rem;color:#9ca3af;margin-bottom:1.25rem;word-break:break-word;">${message}</p>
      <button data-action="restart" style="background:#7c3aed;color:#fff;border:none;border-radius:0.375rem;padding:0.5rem 1.25rem;font-size:0.875rem;cursor:pointer;">
        Clear data &amp; restart
      </button>
    </div>
  `;

  overlay
    .querySelector("[data-action='restart']")
    .addEventListener("click", () => {
      clearAll();
      location.assign("/");
    });

  document.body.appendChild(overlay);
}
