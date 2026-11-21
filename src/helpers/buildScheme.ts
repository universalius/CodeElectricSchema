import {
  ConnectionOrientation,
  type ElecComponentDefinition,
  type Connection,
  type ConnectionLine,
  type Point,
  type ConnectionsBlock,
} from "../types/ElecComponentDefinition";
import { BaseSvgComponent, SVG_NS } from "../types/BaseSvgContainer";
import { createSvgContainer } from "./svgContainerFactory";

export const buildScheme = ({
  components,
  connections,
  showCompIdInsteadLabel = false,
}: {
  components: ElecComponentDefinition[];
  connections: Connection[];
  showCompIdInsteadLabel?: boolean;
}): {
  svgComponents: Array<BaseSvgComponent>;
  linesCoords: Array<Point[]>;
} => {
  //const vccs = components.filter((c) => c.type === ComponentType.Vcc);

  // const rootPossibleComponents = components.filter(({ type }) =>
  //   [ComponentType.Vcc, ComponentType.Gnd, ComponentType.Terminal].includes(
  //     type,
  //   ),
  // );
  // const rootComponents = rootPossibleComponents.filter((c) => {
  //   const { id } = c;
  //   return connections.every(({ to }) => to.componentId != id);
  // });

  // const group = document.createElementNS(SVG_NS, "g");
  const svgComponents: Array<BaseSvgComponent> = [];
  const linesCoords: Array<Point[]> = [];

  console.log("components", components);

  // let index = 0;
  for (const connection of connections) {
    const { from, to, lines } = connection;
    const fromCompDefinition = components.find(
      (c) => c.id === from.componentId,
    );
    const toCompDefinition = components.find((c) => c.id === to.componentId);

    const fromComponent =
      svgComponents.find((c) => c.component.id === from.componentId) ||
      createSvgContainer(fromCompDefinition, showCompIdInsteadLabel);
    const toComponent =
      svgComponents.find((c) => c.component.id === to.componentId) ||
      createSvgContainer(toCompDefinition, showCompIdInsteadLabel);

    // if (index === 0) {
    //   svgComponents.push(fromComponent);
    //   fromComponent.currentPosition = fromComponent.baseSvg.getBBox();
    // }

    if (!fromComponent.currentPosition) {
      svgComponents.push(fromComponent);
      fromComponent.currentPosition = { x: 0, y: 0 };
    }

    const fromPoint = fromComponent.points[from.pointId - 1];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let point1: Point;
      if (i === 0) {
        point1 = fromComponent.getPointCTM(fromPoint);
      } else {
        point1 = linesCoords[linesCoords.length - 1][1];
      }

      const point2 = getLineEndPoint(point1, line);
      linesCoords.push([point1, point2]);
    }

    if (!toComponent.currentPosition) {
      svgComponents.push(toComponent);
      const toPoint = toComponent.points[to.pointId - 1];

      toComponent.currentPosition = moveComponentToPoint(
        toComponent,
        toPoint,
        linesCoords[linesCoords.length - 1][1],
      );
    }
  }

  return {
    svgComponents,
    linesCoords,
  };
};

export const buildSchemeSvg = (
  components: ElecComponentDefinition[],
  connectionsBlocks: ConnectionsBlock[],
  options: { showCompIdInsteadLabel?: boolean } = {},
): SVGSVGElement => {
  //console.log("buildSchemeSvg", connectionsBlocks);

  const svgElement = document.createElementNS(SVG_NS, "svg");
  svgElement.setAttribute("width", "1000");
  svgElement.setAttribute("height", "600");
  svgElement.setAttribute("viewBox", "-75 -75 1000 600");
  svgElement.setAttribute("style", "color: black; background-color: pink;");
  svgElement.setAttribute("xmlns", SVG_NS);

  let lastBlockBox: Box | null = null;

  for (const connectionsBlock of connectionsBlocks) {
    const { svgComponents, linesCoords } = buildScheme({
      components,
      connections: connectionsBlock.connections,
      showCompIdInsteadLabel: options.showCompIdInsteadLabel,
    });

    const componentGroup = document.createElementNS(SVG_NS, "g");
    for (const svgComponent of svgComponents) {
      const baseSvg = svgComponent.baseSvg;
      baseSvg.setAttribute(
        "transform",
        `translate(${svgComponent.currentPosition.x}, ${svgComponent.currentPosition.y})`,
      );

      componentGroup.appendChild(baseSvg);
    }

    const linesGroup = document.createElementNS(SVG_NS, "g");
    for (const [point1, point2] of linesCoords) {
      const lineElement = document.createElementNS(SVG_NS, "line");
      lineElement.setAttribute("x1", String(point1.x));
      lineElement.setAttribute("y1", String(point1.y));
      lineElement.setAttribute("x2", String(point2.x));
      lineElement.setAttribute("y2", String(point2.y));
      lineElement.setAttribute("stroke", "green");
      lineElement.setAttribute("stroke-width", "2");
      linesGroup.appendChild(lineElement);
    }

    const blockGroup = document.createElementNS(SVG_NS, "g");
    blockGroup.appendChild(componentGroup);
    blockGroup.appendChild(linesGroup);

    const blockBox = getBlockBBox(svgComponents, linesCoords);
    let blockBoxInSvg = blockBox;

    const lastGroup = svgElement.lastElementChild;
    if (lastGroup && lastBlockBox && connectionsBlock.position) {
      const translate = getBlockTranslate(
        lastBlockBox,
        blockBox,
        connectionsBlock.position,
      );
      blockGroup.setAttribute(
        "transform",
        `translate(${translate.x}, ${translate.y})`,
      );
      blockBoxInSvg = translateBox(blockBox, translate);
    }

    svgElement.appendChild(blockGroup);
    lastBlockBox = blockBoxInSvg;
  }

  return svgElement;
};

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const BLOCK_SHIFT_PX = 20;
const EXTRA_SHIFT_PX = 20;

const EMPTY_BOX: Box = { x: 0, y: 0, width: 0, height: 0 };

const getBlockBBox = (
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
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const translateBox = (box: Box, translate: Point): Box => ({
  x: box.x + translate.x,
  y: box.y + translate.y,
  width: box.width,
  height: box.height,
});

const getBlockTranslate = (
  lastBox: Box,
  currentBox: Box,
  orientation: ConnectionOrientation,
): Point => {
  switch (orientation) {
    case ConnectionOrientation.Right:
      return {
        x:
          lastBox.x +
          lastBox.width +
          BLOCK_SHIFT_PX +
          EXTRA_SHIFT_PX -
          currentBox.x,
        y: 0,
      };
    case ConnectionOrientation.Left:
      return {
        x:
          lastBox.x -
          BLOCK_SHIFT_PX -
          EXTRA_SHIFT_PX -
          (currentBox.x + currentBox.width),
        y: 0,
      };
    case ConnectionOrientation.Up:
      return {
        x: 0,
        y:
          lastBox.y -
          BLOCK_SHIFT_PX -
          EXTRA_SHIFT_PX -
          (currentBox.y + currentBox.height),
      };
    case ConnectionOrientation.Down:
      return {
        x: 0,
        y:
          lastBox.y +
          lastBox.height +
          BLOCK_SHIFT_PX +
          EXTRA_SHIFT_PX -
          currentBox.y,
      };
    default:
      return { x: 0, y: 0 };
  }
};

/**
 * Compute the translate for a component's group so that its terminal
 * `groupPoint` (in local coordinates) lands exactly on `target` (root SVG coords).
 */
function moveComponentToPoint(
  component: BaseSvgComponent,
  groupPoint: Point,
  target: Point,
): Point {
  // terminal position in root coords = position + transformLocalPoint(groupPoint)
  // so: position = target - transformLocalPoint(groupPoint)
  const local = component.transformLocalPoint(groupPoint);
  return { x: target.x - local.x, y: target.y - local.y };
}

const getLineEndPoint = (point1: Point, line: ConnectionLine): Point => {
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
