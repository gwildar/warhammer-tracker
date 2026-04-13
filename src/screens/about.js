import { navigate } from "../navigate.js";

const app = document.getElementById("app");

export function renderAboutScreen() {
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-2xl mx-auto">
          <button id="back-btn" class="text-sm text-wh-muted hover:text-wh-accent transition-colors">&larr; Back</button>
          <h1 class="text-2xl font-bold text-wh-accent text-center">About</h1>
          <div></div>
        </div>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div class="bg-wh-surface rounded-lg border border-wh-border p-4 space-y-3">
          <h2 class="text-lg font-bold text-wh-text">Turner Overdrive</h2>
          <p class="text-wh-muted text-sm">
            This is a free resource. No profit is being made from this site.
          </p>
        </div>

        <div class="bg-wh-surface rounded-lg border border-wh-border p-4 space-y-3">
          <h2 class="text-lg font-bold text-wh-text">Acknowledgements</h2>
          <p class="text-wh-muted text-sm">
            Army list parsing is powered by
            <a href="https://old-world-builder.com" target="_blank" rel="noopener noreferrer"
              class="text-wh-accent hover:underline">Old World Builder</a>.
            Thank you to the Old World Builder team for making such a fantastic tool for the community.
          </p>
          <p class="text-wh-muted text-sm">
            Huge thanks to  <a href="https://tow.whfb.app" target="_blank" rel="noopener noreferrer"
              class="text-wh-accent hover:underline">Warhammer: The Old World Online Rules Index</a>. for their excellent resource as well.
          </p>
        </div>

        <div class="bg-wh-surface rounded-lg border border-wh-border p-4 space-y-3">
          <h2 class="text-lg font-bold text-wh-text">Disclaimer</h2>
          <p class="text-wh-muted text-sm">
            This web site is completely unofficial and in no way endorsed by Games Workshop Limited.
          </p>
          <p class="text-wh-muted text-xs leading-relaxed">
            Warhammer: the Old World, Citadel, Forge World, Games Workshop, GW, Warhammer,
            the \u2018winged-hammer\u2019 Warhammer logo, the Chaos devices, the Chaos logo, Citadel Device,
            the Double-Headed/Imperial Eagle device, \u2018Eavy Metal, Games Workshop logo, Golden Demon,
            Great Unclean One, the Hammer of Sigmar logo, Horned Rat logo, Keeper of Secrets,
            Khemri, Khorne, Lord of Change, Nurgle, Skaven, the Skaven symbol devices, Slaanesh,
            Tomb Kings, Trio of Warriors, Twin Tailed Comet Logo, Tzeentch, Warhammer Online,
            Warhammer World logo, White Dwarf, the White Dwarf logo, and all associated logos,
            marks, names, races, race insignia, characters, vehicles, locations, units,
            illustrations and images from the Warhammer world are either \u00AE, TM and/or
            \u00A9 Copyright Games Workshop Ltd 2000-2024, variably registered in the UK and
            other countries around the world. Used without permission. No challenge to their
            status intended. All Rights Reserved to their respective owners.
          </p>
        </div>
      </main>
    </div>
  `;

  document.getElementById("back-btn").addEventListener("click", () => {
    navigate("render");
  });
}
