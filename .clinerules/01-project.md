# Project Context

## Purpose
Electrical Scheme Editor — a React app that renders electric schematics from a
custom text-based DSL (domain-specific language).

## Stack
- React 18 + TypeScript + Vite (see `package.json`)
- ESLint (flat config in `eslint.config.js`)
- No runtime dependencies beyond React; rendering is pure SVG via DOM APIs.

## Key files
- `src/App.tsx` — the editor UI (two textareas: Components + Connections).
- `src/helpers/parseCode.ts` — the DSL parser (source of truth for the grammar).
- `src/types/ElecComponentDefinition.ts` — type model: component types,
  orientations, label positions, connection directions, blocks.
- `src/helpers/buildScheme.ts` — turns parsed components/connections into SVG.
- `src/helpers/svgContainerFactory.ts` — maps a component type to its SVG symbol.
- `src/types/components/*` — per-component SVG symbol classes + pin points.
- `LANGUAGE_GUIDE.md` — the full DSL reference. Consult this before any
  scheme-related work.

## Conventions
- The scheme has TWO separate inputs:
  - Components (definitions) — statements separated by `;`.
  - Connections (wires) — statements separated by `;` + newline.
- A component's letter prefix determines its type (R, C, D, LED, Switch, BT, M,
  Dot, IC, …).
- Keep edits idiomatic to the existing code: `export const`/`export function`
  helpers, `type` imports, and `enum`-based domain values.
