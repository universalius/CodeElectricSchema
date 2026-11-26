import { SVG_NS } from "../types/components/BaseSvgComponent";
import type { Point, Size } from "../types/geometry";

export const createRect = (
  point: Point,
  size: Size,
  id?: string,
): SVGRectElement => {
  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("x", String(point.x));
  rect.setAttribute("y", String(point.y));
  rect.setAttribute("width", String(size.width));
  rect.setAttribute("height", String(size.height));
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", "currentColor");

  if (id) {
    rect.setAttribute("id", id);
  }
  return rect;
};

export const createText = (
  point: Point,
  text: string,
  options?: {
    direction?: string;
    transform?: string;
    dominantBaseline?: string;
    textAnchor?: string;
  },
): SVGTextElement => {
  const textElement = document.createElementNS(SVG_NS, "text");
  textElement.setAttribute("x", String(point.x));
  textElement.setAttribute("y", String(point.y));
  textElement.setAttribute("text-anchor", options?.textAnchor ?? "middle");
  textElement.setAttribute(
    "dominant-baseline",
    options?.dominantBaseline ?? "central",
  );

  textElement.textContent = text;

  const { direction, transform } = options ?? {};
  if (direction) {
    textElement.setAttribute("direction", direction);
  }

  if (transform) {
    textElement.setAttribute("transform", transform);
  }

  return textElement;
};

export const createLine = (
  point1: Point,
  point2: Point,
  id?: string,
): SVGLineElement => {
  const lineElement = document.createElementNS(SVG_NS, "line");
  lineElement.setAttribute("x1", String(point1.x));
  lineElement.setAttribute("y1", String(point1.y));
  lineElement.setAttribute("x2", String(point2.x));
  lineElement.setAttribute("y2", String(point2.y));
  lineElement.setAttribute("stroke", "green");
  lineElement.setAttribute("stroke-width", "2");

  if (id) {
    lineElement.setAttribute("id", `line-${id}`);
  }
  return lineElement;
};
