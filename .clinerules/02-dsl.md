# Electrical-scheme DSL — quick rules

Full reference: `LANGUAGE_GUIDE.md` (treat it as the source of truth).

## Components (separated by `;`)
```
<ID> [<label>[-<pos>]] [<orientation>]
```
- Prefix → type: `R` resistor, `C` capacitor, `D` diode, `LED` LED,
  `PD` photodiode, `Switch` switch, `Terminal` terminal, `Vcc` power rail,
  `Gnd` ground, `BT` battery, `M` motor, `Dot` junction, `IC` integrated circuit.
- Label position codes: `t`/`l`/`r`/`b`/`i`.
- Orientation: `hor`, `vert`, `rot-90`, `rot-180`, `rot-270`, `rot-360`.
- Use exactly ONE space between fields.

## IC (multi-line)
```
IC1 ATmega328;      # declare the IC body
IC1-5-t 5;          # add pin: <ICid>-<pinId>-<position> <pinLabel>
```
- Pin positions: `t`/`b`/`l`/`r`.
- Pin ids must be NUMERIC to be referenceable from connections.

## Connections (separated by `;` + newline)
```
<fromId>-<fromPoint> <directions…> <toId>-<toPoint>
```
- Direction tokens: `>` right, `<` left, `^` up, `v` down.
- Each direction may be followed by a pixel length (default 20 px).
- Points: two-terminal parts use `1` (left) / `2` (right); `Dot` uses
  1=left, 2=top, 3=right, 4=bottom; `IC` uses the pin id.

## Blocks
- A line starting with `--- <dir>` starts a new layout block; `<dir>` places the
  next block relative to the previous one (`--- >`, `--- <`, `--- ^`, `--- v`).

## Gotchas
- `MCU` / `Pin` parse but have no SVG renderer — avoid them.
- Unknown prefix → `Unknown component type`; bad direction → `Invalid connection orientation`.
