import {
  type ElecComponentDefinition,
  type Connection,
  type ConnectionLine,
  type Point,
} from "../types/ElecComponentDefinition";
import { BaseSvgComponent, SVG_NS } from "../types/BaseSvgContainer";
import { createSvgContainer } from "./svgContainerFactory";

export const buildScheme = ({
  components,
  connections,
}: {
  components: ElecComponentDefinition[];
  connections: Connection[];
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
      createSvgContainer(fromCompDefinition);
    const toComponent =
      svgComponents.find((c) => c.component.id === to.componentId) ||
      createSvgContainer(toCompDefinition);

    // if (index === 0) {
    //   svgComponents.push(fromComponent);
    //   fromComponent.currentPosition = fromComponent.baseSvg.getBBox();
    // }

    if (!fromComponent.currentPosition) {
      svgComponents.push(fromComponent);
      fromComponent.currentPosition = fromComponent.baseSvg.getBBox();
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

      toComponent.currentPosition = moveGroupToPoint(
        toComponent.baseSvg,
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
  connections: Connection[],
): SVGSVGElement => {
  const { svgComponents, linesCoords } = buildScheme({
    components,
    connections,
  });
  const svgElement = document.createElementNS(SVG_NS, "svg");
  svgElement.setAttribute("width", "500");
  svgElement.setAttribute("height", "300");
  svgElement.setAttribute("viewBox", "-75 -75 250 150");
  svgElement.setAttribute("style", "color: black; background-color: pink;");
  svgElement.setAttribute("xmlns", SVG_NS);

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
  svgElement.appendChild(componentGroup);
  svgElement.appendChild(linesGroup);

  return svgElement;
};

function moveGroupToPoint(
  group: SVGGElement,
  groupPoint: Point, // e.g. group.getBoundingClientRect().left/top
  // rect: SVGRectElement,
  target: Point, // e.g. mouse event.clientX or getBoundingClientRect().left
): Point | undefined {
  const groupCTM = group.getScreenCTM();
  if (!groupCTM) return;

  // 1. Convert target screen coordinates into the parent's SVG coordinate space
  // const pt = svg.createSVGPoint();
  // pt.x = targetScreenX;
  // pt.y = targetScreenY;
  const pt = new DOMPoint(target.x, target.y);
  const localTarget = pt.matrixTransform(groupCTM.inverse());

  // 2. Account for the rect's local offset inside the <g>
  // (If rect is at x="0" y="0", rectBox.x and rectBox.y are 0)
  // const rectBox = rect.getBBox();
  const tx = localTarget.x - groupPoint.x;
  const ty = localTarget.y - groupPoint.y;

  // 3. Move the entire <g> group (moves both rect and text together)
  // if (animate) {
  //   group.style.transition = "transform 300ms ease-out";
  // } else {
  //   group.style.transition = "none";
  // }
  // group.style.transform = `translate(${tx}px, ${ty}px)`;

  return { x: tx, y: ty };
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
