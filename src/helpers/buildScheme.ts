import {
  type ElecComponentDefinition,
  type Connection,
  type ConnectionsBlock,
} from "../types/ElecComponentDefinition";
import { BaseSvgComponent, SVG_NS } from "../types/components/BaseSvgComponent";
import type { Box, Point } from "../types/geometry";
import {
  getLineEndPoint,
  moveComponentToPoint,
  getBlockTranslate,
  translateBox,
  getBlockBox,
} from "./componentPositionHelpers";
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
  const svgComponents: Array<BaseSvgComponent> = [];
  const linesCoords: Array<Point[]> = [];

  for (const connection of connections) {
    const { from, to, lines } = connection;
    const fromCompDefinition = components.find(
      (c) => c.id === from.componentId,
    );
    const toCompDefinition = components.find((c) => c.id === to.componentId);

    const fromComponent =
      svgComponents.find((c) => c.compDefinition.id === from.componentId) ||
      createSvgContainer(fromCompDefinition, showCompIdInsteadLabel);
    const toComponent =
      svgComponents.find((c) => c.compDefinition.id === to.componentId) ||
      createSvgContainer(toCompDefinition, showCompIdInsteadLabel);

    if (!fromComponent.currentPosition) {
      svgComponents.push(fromComponent);
      fromComponent.currentPosition = { x: 0, y: 0 };
    }

    const fromPoint = fromComponent.points[from.pointId];
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
      const toPoint = toComponent.points[to.pointId];

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
      const baseSvg = svgComponent.svgComponent;
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

    const blockBox = getBlockBox(svgComponents, linesCoords);
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
