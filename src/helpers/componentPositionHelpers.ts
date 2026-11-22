import type { BaseSvgComponent } from "../types/components";
import {
  ConnectionOrientation,
  type ConnectionLine,
} from "../types/ElecComponentDefinition";
import type { Box, Point } from "../types/geometry";

const BLOCK_SHIFT_PX = 20;
const EXTRA_SHIFT_PX = 20;

const EMPTY_BOX: Box = {
  topLeftCorner: { x: 0, y: 0 },
  size: { width: 0, height: 0 },
};

export const getBlockBox = (
  svgComponents: Array<BaseSvgComponent>,
  linesCoords: Array<Point[]>,
): Box => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const includePoint = (point: Point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  };

  for (const component of svgComponents) {
    const corners: Point[] = [
      { x: 0, y: 0 },
      { x: component.width, y: 0 },
      { x: 0, y: component.height },
      { x: component.width, y: component.height },
    ];

    for (const corner of corners) {
      const oriented = component.transformLocalPoint(corner);
      includePoint({
        x: oriented.x + component.currentPosition.x,
        y: oriented.y + component.currentPosition.y,
      });
    }

    for (const point of component.points) {
      includePoint(component.getPointCTM(point));
    }
  }

  for (const [point1, point2] of linesCoords) {
    includePoint(point1);
    includePoint(point2);
  }

  if (minX > maxX || minY > maxY) {
    return EMPTY_BOX;
  }

  return {
    topLeftCorner: { x: minX, y: minY },
    size: { width: maxX - minX, height: maxY - minY },
  };
};

export const translateBox = (box: Box, translate: Point): Box => ({
  topLeftCorner: {
    x: box.topLeftCorner.x + translate.x,
    y: box.topLeftCorner.y + translate.y,
  },
  size: box.size,
});

export const getBlockTranslate = (
  lastBox: Box,
  currentBox: Box,
  orientation: ConnectionOrientation,
): Point => {
  switch (orientation) {
    case ConnectionOrientation.Right:
      return {
        x:
          lastBox.topLeftCorner.x +
          lastBox.size.width +
          BLOCK_SHIFT_PX +
          EXTRA_SHIFT_PX -
          currentBox.topLeftCorner.x,
        y: 0,
      };
    case ConnectionOrientation.Left:
      return {
        x:
          lastBox.topLeftCorner.x -
          BLOCK_SHIFT_PX -
          EXTRA_SHIFT_PX -
          (currentBox.topLeftCorner.x + currentBox.size.width),
        y: 0,
      };
    case ConnectionOrientation.Up:
      return {
        x: 0,
        y:
          lastBox.topLeftCorner.y -
          BLOCK_SHIFT_PX -
          EXTRA_SHIFT_PX -
          (currentBox.topLeftCorner.y + currentBox.size.height),
      };
    case ConnectionOrientation.Down:
      return {
        x: 0,
        y:
          lastBox.topLeftCorner.y +
          lastBox.size.height +
          BLOCK_SHIFT_PX +
          EXTRA_SHIFT_PX -
          currentBox.topLeftCorner.y,
      };
    default:
      return { x: 0, y: 0 };
  }
};

/**
 * Compute the translate for a component's group so that its terminal
 * `groupPoint` (in local coordinates) lands exactly on `target` (root SVG coords).
 */
export function moveComponentToPoint(
  component: BaseSvgComponent,
  groupPoint: Point,
  target: Point,
): Point {
  // terminal position in root coords = position + transformLocalPoint(groupPoint)
  // so: position = target - transformLocalPoint(groupPoint)
  const local = component.transformLocalPoint(groupPoint);
  return { x: target.x - local.x, y: target.y - local.y };
}

export const getLineEndPoint = (point1: Point, line: ConnectionLine): Point => {
  const defaultLength = 20; // default length if not specified
  if (line.orientation === ">") {
    return {
      x: point1.x + (line.length ?? defaultLength),
      y: point1.y,
    };
  }

  if (line.orientation === "<") {
    return {
      x: point1.x - (line.length ?? defaultLength),
      y: point1.y,
    };
  }

  if (line.orientation === "^") {
    return {
      x: point1.x,
      y: point1.y - (line.length ?? defaultLength),
    };
  }

  if (line.orientation === "v") {
    return {
      x: point1.x,
      y: point1.y + (line.length ?? defaultLength),
    };
  }

  throw new Error(`Unknown line orientation: ${line.orientation}`);
};
