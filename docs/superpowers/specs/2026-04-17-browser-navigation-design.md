# Browser Navigation — Design Spec

**Date:** 2026-04-17  
**Status:** Approved

## Goal

Add browser back-button support and per-screen URLs to the app. Users can navigate backwards through game phases and setup screens using the browser's native back/forward controls.

## Constraints

- Hash routing (required for GitHub Pages deployment at `/turner-overdrive/`)
- Vanilla JS — no framework introduction
- Use Navigo as the routing library (~5kb, designed for vanilla JS SPAs)
- localStorage remains the source of truth for all game data

## URL Scheme

```
#/                                          → notFound handler (init redirect)
#/setup                                     → SetupScreen
#/unit-assignment                           → UnitAssignmentScreen
#/spell-selection                           → SpellSelectionScreen
#/scenario-setup                            → ScenarioSetupScreen
#/deployment                                → DeploymentScreen
#/first-turn                                → FirstTurnScreen
#/game/:round/:phase/:subphase              → GameScreen (player's turn)
#/opponent/:round/:phase/:subphase          → OpponentTurnScreen
#/game-over                                 → GameOverScreen
#/about                                     → AboutScreen
```

In-game URL examples:

```
#/game/1/strategy/start-of-turn
#/game/1/movement/declare-charges
#/game/2/combat/choose-fight
#/opponent/1/shooting/shoot
```

Phase and subphase segments use the existing IDs from `phases.js` (e.g. `strategy`, `start-of-turn`). This is stable if subphases are reordered and self-documenting in browser history.

## Architecture

**localStorage stays as source of truth.** The URL reflects the current screen. On back-button press, the URL changes, the route handler fires, syncs localStorage from URL params, and calls the render function.

**Back-button flow for game screen:**

1. Hash changes to e.g. `#/game/1/movement/declare-charges`
2. Navigo fires the `/game/:round/:phase/:subphase` route handler
3. Handler looks up `phaseIndex` via `subPhaseToIndex('movement', 'declare-charges')`
4. Handler syncs localStorage: `saveRound(1)`, `saveIsOpponentTurn(false)`, `savePhaseIndex(idx)`
5. Handler calls `renderGameScreen(getArmy())`

All other screens (setup, deployment, etc.) don't need state synced from URL — their route handlers simply call the render function.

## Files Changed

### `navigate.js` — replace registry with Navigo

Remove the screen registry (`screens`, `registerScreen`). Export a Navigo router instance and a `navigate(path)` wrapper.

```js
import Navigo from "navigo";
export const router = new Navigo("/", { hash: true });
export function navigate(path) {
  router.navigate(path);
}
```

### `phases.js` — new helper

Add `subPhaseToIndex(phaseId, subPhaseId)` for back-button state restoration:

```js
export function subPhaseToIndex(phaseId, subPhaseId) {
  return getAllSubPhases().findIndex(
    (s) => s.phase.id === phaseId && s.subPhase.id === subPhaseId,
  );
}
```

### `main.js` — route definitions replace screen registry + init logic

- Remove all `registerScreen(...)` calls
- Remove the `render()` function
- Define routes via `router.on(...).notFound(...).resolve()`
- Each game/opponent route handler: parse params, sync localStorage, call render
- `guardArmy(fn)` helper: if `getArmy()` is null, redirect to `/setup`; otherwise call `fn(army)`
- `.notFound()` replaces the existing `render()` init function — reads localStorage state and redirects to the correct URL

```js
// notFound handler logic (replaces existing render())
const army = getArmy();
if (!army || !getFirstTurn()) {
  navigate("/setup");
} else if (getIsOpponentTurn()) {
  const { phase, subPhase } = allSubPhases[getPhaseIndex()];
  navigate(`/opponent/${getRound()}/${phase.id}/${subPhase.id}`);
} else {
  const { phase, subPhase } = allSubPhases[getPhaseIndex()];
  navigate(`/game/${getRound()}/${phase.id}/${subPhase.id}`);
}
```

### `game.js` — `recordAndNavigate` builds URL instead of calling render

State saves (round, phaseIndex, isOpponentTurn) move out of `recordAndNavigate` and into the route handlers. `recordCurrentPhaseTime` stays in `recordAndNavigate` — it must fire before navigation.

```js
function recordAndNavigate(army, newPhaseIdx, isOpponentTurn, isPrev) {
  recordCurrentPhaseTime(false);
  const newRound =
    isOpponentTurn && !isPrev && getFirstTurn() === "opponent"
      ? getRound() + 1
      : isOpponentTurn && isPrev && getFirstTurn() === "you"
        ? getRound() - 1
        : getRound();
  const { phase, subPhase } = allSubPhases[newPhaseIdx];
  const prefix = isOpponentTurn ? "opponent" : "game";
  navigate(`/${prefix}/${newRound}/${phase.id}/${subPhase.id}`);
}
```

### All other screens — call-site changes

Every `navigate("screenName", army)` becomes a `navigate('/path')` call. The `army` argument is dropped from navigation calls — route handlers always call `getArmy()` themselves.

| Before                                   | After                                                       |
| ---------------------------------------- | ----------------------------------------------------------- |
| `navigate("setupScreen")`                | `navigate('/setup')`                                        |
| `navigate("unitAssignmentScreen", army)` | `navigate('/unit-assignment')`                              |
| `navigate("spellSelectionScreen", army)` | `navigate('/spell-selection')`                              |
| `navigate("scenarioSetupScreen", army)`  | `navigate('/scenario-setup')`                               |
| `navigate("deploymentScreen", army)`     | `navigate('/deployment')`                                   |
| `navigate("firstTurnScreen", army)`      | `navigate('/first-turn')`                                   |
| `navigate("gameOverScreen", army)`       | `navigate('/game-over')`                                    |
| `navigate("aboutScreen")`                | `navigate('/about')`                                        |
| `navigate("gameScreen", army)`           | `navigate('/game/${round}/${phase.id}/${subPhase.id}')`     |
| `navigate("opponentTurnScreen", army)`   | `navigate('/opponent/${round}/${phase.id}/${subPhase.id}')` |
| `navigate("render")`                     | removed (replaced by `.notFound()` in main.js)              |

For `gameScreen` and `opponentTurnScreen` redirects (e.g. from first-turn.js when starting a new game), build the URL from current localStorage state at the point of navigation.

## Guard Rails

- Any route requiring an army uses `guardArmy` — redirects to `/setup` if `getArmy()` returns null
- `.notFound()` handles unknown hashes and the empty `#/` case
- Existing schema version guard and error recovery in `main.js` are unchanged
