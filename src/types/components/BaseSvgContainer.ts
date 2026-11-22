import {
  LabelPosition,
  Orientation,
  type ElecComponentDefinition,
} from "../ElecComponentDefinition";
import type { Point } from "../geometry";

export const SVG_NS = "http://www.w3.org/2000/svg" as const;

export class BaseSvgComponent {
  svgElement: SVGSVGElement;
  width: number;
  height: number;
  rotationAngle: number;
  component: ElecComponentDefinition;
  currentPosition: Point;
  showCompIdInsteadLabel = false;
  private _baseSvg: SVGGElement | null = null;

  labelHeight = 36;

  constructor(svgString: string, component: ElecComponentDefinition) {
    this.svgElement = this.parseSvgString(svgString);
    this.width = this.svgElement.width.baseVal.value;
    this.height = this.svgElement.height.baseVal.value;
    this.component = component;
    this.rotationAngle = this.getRotation(component?.orientation);
  }

  get points(): Array<Point> {
    // Terminals are always the left-middle and right-middle of the symbol in
    // LOCAL coordinates. Rotation is handled by the transform attribute, so the
    // local terminal points never change based on orientation.
    return [
      { x: 0, y: this.height / 2 },
      { x: this.width, y: this.height / 2 },
    ];
  }

  get baseSvg(): SVGGElement {
    if (this._baseSvg) {
      return this._baseSvg;
    }

    this._baseSvg = this.buildBaseSvg();

    return this._baseSvg;
  }

  private buildBaseSvg(): SVGGElement {
    const rotate = this.rotationAngle
      ? `rotate(${this.rotationAngle})`
      : undefined;
    const translate = this.getTranslate(
      this.rotationAngle,
      this.width,
      this.height,
    );

    const transform = [translate, rotate].filter(Boolean).join(" ");

    const labelCoords = this.getLabelCoords(
      this.rotationAngle,
      this.width,
      this.height,
      this.component?.label?.position,
    );

    const group = document.createElementNS(SVG_NS, "g");

    const label = this.component.label;
    if (label?.name) {
      const text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(labelCoords.x));
      text.setAttribute("y", String(labelCoords.y));
      if (
        !label.position ||
        [LabelPosition.Top, LabelPosition.Bottom].includes(label.position)
      ) {
        text.setAttribute("text-anchor", "middle");
      }
      if (labelCoords.direction) {
        text.setAttribute("direction", labelCoords.direction);
      }
      text.textContent = this.showCompIdInsteadLabel
        ? this.component.id
        : label.name;
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

    return group;
  }

  /**
   * Maps a point from the component's local (unrotated) coordinate space to
   * its orientation-adjusted coordinates (rotate + orientation translate),
   * WITHOUT the scheme position translate.
   */
  transformLocalPoint(localPoint: Point): Point {
    // normalize to one of 0 / 90 / 180 / 270
    const angle = ((this.rotationAngle % 360) + 360) % 360;

    // 1) rotate(angle) around the origin (innermost SVG transform)
    let rx: number;
    let ry: number;
    switch (angle) {
      case 90:
        rx = -localPoint.y;
        ry = localPoint.x;
        break;
      case 180:
        rx = -localPoint.x;
        ry = -localPoint.y;
        break;
      case 270:
        rx = localPoint.y;
        ry = -localPoint.x;
        break;
      default:
        rx = localPoint.x;
        ry = localPoint.y;
    }

    // 2) orientation translate (mirrors getTranslate())
    const ox = angle === 90 ? this.height : angle === 180 ? this.width : 0;
    const oy = angle === 180 ? this.height : angle === 270 ? this.width : 0;

    return { x: rx + ox, y: ry + oy };
  }

  getPointCTM(localPoint: Point): Point {
    const transformed = this.transformLocalPoint(localPoint);

    // 3) scheme position (the translate set on the component's group)
    return {
      x: transformed.x + (this.currentPosition?.x ?? 0),
      y: transformed.y + (this.currentPosition?.y ?? 0),
    };
  }

  private getRotation(orientation: Orientation): number {
    if (!orientation || orientation === Orientation.Horizontal) {
      return 0;
    }

    if (
      orientation === Orientation.Vertical ||
      orientation === Orientation.Rot90
    ) {
      return 90;
    }

    if (orientation === Orientation.Rot180) {
      return 180;
    }

    if (orientation === Orientation.Rot270) {
      return 270;
    }

    if (orientation === Orientation.Rot360) {
      return 360;
    }

    return 0;
  }

  private getTranslate(angle: number, width: number, height: number): string {
    if (angle === 90) {
      return `translate(${height}, 0)`;
    }

    if (angle === 180) {
      return `translate(${width}, ${height})`;
    }

    if (angle === 270) {
      return `translate(0, ${width})`;
    }

    return undefined;
  }

  private parseSvgString(svgString: string): SVGSVGElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");

    // Check for XML parsing errors
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      throw new Error(`Failed to parse SVG: ${parserError.textContent}`);
    }

    return doc.documentElement as unknown as SVGSVGElement;
  }

  private getLabelCoords(
    angle: number,
    componentWidth: number,
    componentHeight: number,
    labelPosition: LabelPosition,
  ): { x: number; y: number; direction?: string } {
    let width = componentWidth;
    let height = componentHeight;

    if (angle == 90 || angle == 270) {
      width = componentHeight;
      height = componentWidth;
    }

    if (labelPosition === LabelPosition.Top) {
      return { x: width / 2, y: 0 };
    }

    if (labelPosition === LabelPosition.Bottom) {
      return { x: width / 2, y: height + this.labelHeight / 2 };
    }

    if (labelPosition === LabelPosition.Left) {
      return { x: 0, y: height / 2 + this.labelHeight / 6, direction: "rtl" };
    }

    if (labelPosition === LabelPosition.Right) {
      return { x: width, y: height / 2 + this.labelHeight / 6 };
    }

    return { x: width / 2, y: 0 };
  }
}
