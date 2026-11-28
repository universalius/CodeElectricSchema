# Electrical Scheme Language — Reference Guide

This document describes the **domain-specific language (DSL)** used by this
project to describe electric schematics. The language is defined in
[`src/helpers/parseCode.ts`](./src/helpers/parseCode.ts) and modelled in
[`src/types/ElecComponentDefinition.ts`](./src/types/ElecComponentDefinition.ts).

---

## 1. Overview

A scheme is described by **two separate text inputs**:

1. **Components** (definitions) — *what* the elements are.
2. **Connections** (wires) — *how* the elements are joined together.

Both are fed to `parseCode(definitionsText, connectionsText)`, which produces:

- `components` — the parsed electrical components, and
- `connectionsBlocks` — the parsed wire connections grouped into layout blocks.

The renderer ([`src/helpers/buildScheme.ts`](./src/helpers/buildScheme.ts)) then
turns those into SVG. The two inputs have **different** statement separators,
so keep them in their own text areas.

---

## 2. Component definitions

### 2.1 Syntax

Component statements are separated by a **semicolon `;`**. Each statement has
the following shape (fields are separated by a **single space**):

```
<ID> [<label>[-<position>]] [<orientation>]
```

- `<ID>` — required. Its **letter prefix** selects the component type (see table).
- `<label>` — optional display label (text drawn on/next to the symbol).
- `<position>` — optional label position, one of the short codes below.
- `<orientation>` — optional rotation of the symbol.

**Important:** use exactly one space between fields. Extra spaces create empty
fields and break parsing.

### 2.2 Component types (by ID prefix)

| Prefix | Type           | Rendered as | Default points (1 / 2) |
|--------|----------------|-------------|------------------------|
| `R`    | Resistor       | resistor    | left / right           |
| `C`    | Capacitor      | capacitor   | left / right           |
| `Vcc`  | Power rail     | terminal    | left / right           |
| `Gnd`  | Ground         | terminal    | left / right           |
| `Switch` | Switch       | switch      | left / right           |
| `Terminal` | Terminal  | terminal    | left / right           |
| `D`    | Diode          | diode       | 1 = anode, 2 = cathode |
| `PD`   | Photodiode (IR receiver) | photodiode | 1 = anode, 2 = cathode |
| `LED`  | LED            | LED         | 1 = anode, 2 = cathode |
| `M`    | Motor          | motor       | left / right           |
| `BT`   | Battery        | battery     | left / right           |
| `Dot`  | Junction dot   | dot         | 1=left, 2=top, 3=right, 4=bottom |
| `IC`   | Integrated circuit | IC block (multi-line, see §3) | per-pin id |
| `MCU`  | Microcontroller | *parsed only* — no symbol yet | — |
| `Pin`  | Pin            | *parsed only* — no symbol yet | — |

> **Note:** `MCU` and `Pin` are recognised by the parser (they exist in the
> `ComponentType` enum) but there is no SVG renderer wired up for them yet, so
> they will throw `Unsupported component type` at render time.

### 2.3 Label position codes

| Code | Position |
|------|----------|
| `t`  | top      |
| `l`  | left     |
| `r`  | right    |
| `b`  | bottom   |
| `i`  | inside   |

A label is written as `name-position`, e.g. `5V-t` = label "5V" above the
symbol. A plain label with no `-position` (e.g. `R1`) is drawn at the default
position (top).

### 2.4 Orientation values

| Value      | Rotation   |
|------------|------------|
| `hor`      | 0° (default) |
| `vert`     | 90°        |
| `rot-90`   | 90°        |
| `rot-180`  | 180°       |
| `rot-270`  | 270°       |
| `rot-360`  | 360°       |

`vert` and `rot-90` are equivalent.

### 2.5 Examples

```
Vcc1 5V-t;
R1 R1;
D1 D1-r;
C1 C1;
LED1 LED1;
Switch1 K1;
BT1 9V-b vert;
```

---

## 3. Integrated circuits (IC)

An IC is declared in **two steps** (multiple lines):

1. First declare the IC body:
   ```
   IC1 ATmega328;
   ```
2. Then add each pin on its own line:
   ```
   IC1-PB5-t PB5;
   IC1-PD3-r PD3;
   ```

The pin line format is:

```
<ICid>-<pinId>-<position> <pinLabel>
```

- `<ICid>` — must match an already-declared `IC…` id.
- `<pinId>` — unique identifier for the pin. This is also how you reference the
  pin in a connection.
- `<position>` — which side of the IC the pin sits on: `t` (top), `b` (bottom),
  `l` (left) or `r` (right).
- `<pinLabel>` — the text shown next to the pin.

> **Important (current limitation):** connections resolve a component's pin via
> `parseInt(...)`, so **use numeric pin ids** (e.g. `IC1-5-t 5;`). String ids
> such as `PB5` will not resolve when referenced from a connection.

---

## 4. Connections

### 4.1 Syntax

Connection statements are separated by **`;` + newline** (a semicolon at the
end of the line, followed by a line break). Each statement:

```
<fromId>-<fromPoint> <directions…> <toId>-<toPoint>
```

- `<fromId>-<fromPoint>` — where the wire starts.
- `<toId>-<toPoint>` — the component placed at the end of the wire.
- `<directions…>` — one or more direction tokens (see §4.2).

Example:

```
Vcc1-2 > R1-1;
R1-2 > D1-1;
```

### 4.2 Direction tokens

| Token | Meaning |
|-------|---------|
| `>`   | draw right |
| `<`   | draw left  |
| `^`   | draw up    |
| `v`   | draw down  |

Each direction token may be followed by a **length in pixels**. If omitted, the
default length is **20 px**.

So `Vcc1-2 > 100 ^ 50 R1-1` means: from `Vcc1` pin 2, draw **right 100 px**,
then **up 50 px**, then place `R1` at the end of that path.

> The wire is drawn step by step from the `from` terminal. The `to` component is
> then **moved** so that its referenced pin lands on the final endpoint of the
> path.

### 4.3 Point numbering

- Two-terminal components (`R`, `C`, `Vcc`, `Gnd`, `Switch`, `Terminal`, `D`,
  `PD`, `LED`, `M`, `BT`): `1` = left, `2` = right.
- Junction `Dot`: `1` = left, `2` = top, `3` = right, `4` = bottom.
- `IC`: use the **pin id** defined in the component block (numeric ids only —
  see §3).

### 4.4 Layout blocks

A line starting with `---` separates **blocks** of connections. The orientation
on that line controls where the *next* block is placed relative to the
*previous* block:

```
Vcc1-2 > R1-1;
R1-2 > D1-1;
--- >
D1-2 > C1-1;
C1-2 > LED1-1;
```

The `--- >` above means "place the following block to the **right** of the
block before it". Available block positions:

| Separator | Next block placed |
|-----------|-------------------|
| `--- >`   | to the right      |
| `--- <`   | to the left       |
| `--- ^`   | above             |
| `--- v`   | below             |

Each block is an independent layout starting from the origin; the block
position only shifts the whole block relative to the previous one.

---

## 5. Complete worked example

**Components:**

```
Vcc1 5V-t;
R1 R1;
D1 D1;
C1 C1;
LED1 LED1;
Switch1 K1;
Gnd1 GND-b;
```

**Connections:**

```
Vcc1-2 > R1-1;
R1-2 > D1-1;
D1-2 > C1-1;
C1-2 > LED1-1;
LED1-2 > Switch1-1;
Switch1-2 > Gnd1-1;
```

This builds a simple series circuit: power rail → resistor → diode → capacitor
→ LED → switch → ground.

---

## 6. Errors & gotchas

- **Separators differ.** Components use `;`; connections use `;` + newline.
  A connection written on the same line as the next one will not parse.
- **Single spaces only** between fields inside a statement. `R1  R1` (two
  spaces) silently drops the label.
- **Unknown type prefix** throws `Unknown component type: <id>`.
- **Invalid direction token** throws `Invalid connection orientation: <token>`.
- **`MCU` / `Pin`** parse but have no renderer — avoid them until a symbol is
  added.
- **IC pin ids must be numeric** to be referenced from connections (see §3).
- The SVG canvas is fixed at `viewBox="0 0 1000 600"` with a 75 px margin
  (`-75 -75 1000 600`), so very large or very long schemes may be clipped.

