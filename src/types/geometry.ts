export type Point = { x: number; y: number };

export type Size = { width: number; height: number };

export type Box = {
  topLeftCorner: Point;
  size: Size;
};
