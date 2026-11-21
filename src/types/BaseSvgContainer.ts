import {
  getRotation,
  parseSvgString,
  getTranslate,
  getLabelCoords,
} from "../helpers/componentPositionHelpers";
import type { ElecComponentDefinition, Point } from "./ElecComponentDefinition";

export const SVG_NS = "http://www.w3.org/2000/svg" as const;

export class BaseSvgComponent {
  svgElement: SVGSVGElement;
  width: number;
  height: number;
  rotationAngle: number;
  component: ElecComponentDefinition;
  currentPosition: Point;

  constructor(svgString: string, component: ElecComponentDefinition) {
    this.svgElement = parseSvgString(svgString);
    this.width = this.svgElement.width.baseVal.value;
    this.height = this.svgElement.height.baseVal.value;
    this.component = component;
    this.rotationAngle = getRotation(component?.orientation);
  }

  get points(): Array<Point> {
    console.log(
      "this.rotationAngle",
      this.rotationAngle,
      "this.width",
      this.width,
      "this.height",
      this.height,
    );
    if (this.rotationAngle === 0 || this.rotationAngle === 180) {
      return [
        { x: 0, y: this.height / 2 },
        { x: this.width, y: this.height / 2 },
      ];
    }

    return [
      { x: this.width / 2, y: 0 },
      { x: this.width / 2, y: this.height },
    ];
  }

  get baseSvg(): SVGGElement {
    const rotate = this.rotationAngle
      ? `rotate(${this.rotationAngle})`
      : undefined;
    const translate = getTranslate(this.rotationAngle, this.width, this.height);

    const transform = [translate, rotate].filter(Boolean).join(" ");

    const labelCoords = getLabelCoords(
      this.rotationAngle,
      this.width,
      this.height,
      this.component?.label?.position,
    );

    const group = document.createElementNS(SVG_NS, "g");

    const label = this.component?.label;
    if (label?.name) {
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(labelCoords.x));
      text.setAttribute("y", String(labelCoords.y));
      if (labelCoords.direction) {
        text.setAttribute("direction", labelCoords.direction);
      }
      text.textContent = label.name;
      group.appendChild(text);
    }

    const innerGroup = document.createElementNS(SVG_NS, "g");
    if (transform) {
      innerGroup.setAttribute("transform", transform);
    }
    Array.from(this.svgElement.childNodes).forEach((node) =>
      innerGroup.appendChild(node.cloneNode(true)),
    );
    group.appendChild(innerGroup);

    return group as never as SVGGElement;
  }

  getPointCTM(localPoint: Point): Point {
    console.log("localPoint", localPoint, "this.baseSvg", this.baseSvg);
    const ctm = this.baseSvg.getScreenCTM();

    //Transform the local point into the root SVG coordinate space
    return new DOMPoint(localPoint.x, localPoint.y).matrixTransform(ctm);
  }
}
