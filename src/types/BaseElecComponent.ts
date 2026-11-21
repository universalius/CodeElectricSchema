// R1 label-(t,l,r,b) orientation(hor/vert);
// C1 label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);
// Vcc1 label-(t,l,r,b);
// Gnd1 label-(t,l,r,b);
// Switch1 label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);
// Terminal1 label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);
// D1 label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);
// PD1 label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);
// LED1 label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);

//MCU label-(t,l,r,b) orientation(hor/vert, rot-90, rot-180, rot-270);
//Pin1 label-(t,l,r,b);

// R1-1 -/| length C1-1
// C1-2 - | - | - R2-1

export enum LabelPosition {
  Top = "t",
  Left = "l",
  Right = "r",
  Bottom = "b",
}

export type Label = {
  name: string;
  position?: LabelPosition;
};

export enum Orientation {
  Horizontal = "hor",
  Vertical = "vert",
  Rot90 = "rot-90",
  Rot180 = "rot-180",
  Rot270 = "rot-270",
  Rot360 = "rot-360",
}

export enum ComponentType {
  R = "Resistor",
  C = "Capacitor",
  Vcc = "Vcc",
  Gnd = "Gnd",
  Switch = "Switch",
  Terminal = "Terminal",
  D = "Diode",
  PD = "Photodiode",
  LED = "LED",
  MCU = "Microcontroller",
  Pin = "Pin",
}

export type BaseElecComponent = {
  id: string;
  type: ComponentType;
  label?: Label;
  orientation?: Orientation;
};

export enum ConnectionOrientation {
  Horizontal = "-",
  Vertical = "|",
}

export type ConnectionPoint = {
  id: string;
  point: number;
};

export type ConnectionLine = {
  orientation: ConnectionOrientation;
  length?: number;
};

export type Connection = {
  from: ConnectionPoint;
  to: ConnectionPoint;
  lines: ConnectionLine[];
};
