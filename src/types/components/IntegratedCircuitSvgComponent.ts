import {
  ComponentPosition,
  type ElecComponentDefinition,
  type Pin,
} from "../ElecComponentDefinition";

import { BaseSvgComponent, SVG_NS } from "./BaseSvgComponent";
import type { Point, Size } from "../geometry";

export class IntegratedCircuitSvgComponent extends BaseSvgComponent {
  readonly pinHeight = 20;
  readonly pinWidth = 20;
  readonly emptyWidth = 20;
  readonly emptyHeight = 20;
  private pinSides: Record<ComponentPosition, Array<Pin>>;

  constructor(component: ElecComponentDefinition) {
    super(undefined, component);
    this.pinSides = this.getPinSides();
    this.size = this.calcSize();
    this.svgComponent = this.buildSvgComponent();
  }

  override get points(): Record<string, Point> {
    const halfPinHeight = this.pinHeight / 2;
    const points: Record<string, Point> = {};
    this.compDefinition.pins.forEach((p) => {
      const pinRect = this.svgComponent.querySelector<SVGRectElement>(
        `[id="${p.id}"]`,
      );
      let point;
      switch (p.position) {
        case ComponentPosition.Left:
        case ComponentPosition.Right:
          point = {
            x: pinRect.x.baseVal.value,
            y: pinRect.y.baseVal.value + halfPinHeight,
          };
          break;
        case ComponentPosition.Top:
        case ComponentPosition.Bottom:
          point = {
            x: pinRect.x.baseVal.value + halfPinHeight,
            y: pinRect.y.baseVal.value,
          };
          break;
      }

      points[p.id] = point;
    });

    return points;
  }

  getPinSides(): Record<ComponentPosition, Array<Pin>> {
    const groups = [
      ...Map.groupBy(this.compDefinition.pins, (pin) => pin.position),
    ];
    return {
      t: groups
        .filter(([key]) => key === ComponentPosition.Top)
        .flatMap(([_, value]) => value),
      b: groups
        .filter(([key]) => key === ComponentPosition.Bottom)
        .flatMap(([_, value]) => value),
      l: groups
        .filter(([key]) => key === ComponentPosition.Left)
        .flatMap(([_, value]) => value),
      r: groups
        .filter(([key]) => key === ComponentPosition.Right)
        .flatMap(([_, value]) => value),
    };
  }

  calcSize(): Size {
    const { b, l, r, t } = this.pinSides;
    const horPinsCount = Math.max(...[(l ?? []).length, (r ?? []).length]);
    const vertPinsCount = Math.max(...[(t ?? []).length, (b ?? []).length]);

    // const emptyWidthSpace =
    //   (l.length > 0 || r.length > 0) && t.length === 0 && b.length === 0
    //     ? this.emptyWidth
    //     : 0;
    // const emptyHeightSpace =
    //   (t.length > 0 || b.length > 0) && l.length === 0 && r.length === 0
    //     ? this.emptyHeight
    //     : 0;

    return {
      height: horPinsCount
        ? horPinsCount * this.pinHeight
        : (t.length ? this.pinWidth : 0) +
          this.emptyHeight +
          (b.length ? this.pinWidth : 0),
      width:
        (l.length ? this.pinWidth : 0) +
        (vertPinsCount ? vertPinsCount * this.pinHeight : this.emptyWidth) +
        (r.length ? this.pinWidth : 0),
    };
  }

  createRect(point: Point, size: Size, id?: string): SVGRectElement {
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(point.x));
    rect.setAttribute("y", String(point.y));
    rect.setAttribute("width", String(size.width));
    rect.setAttribute("height", String(size.height));
    rect.setAttribute("height", String(size.height));
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", "currentColor");

    if (id) {
      rect.setAttribute("id", id);
    }
    return rect;
  }

  override buildSvgComponent(): SVGGElement {
    const group = document.createElementNS(SVG_NS, "g");
    const rectContainer = this.createRect({ x: 0, y: 0 }, this.size);

    for (const [key, pins] of Object.entries(this.pinSides)) {
      if (pins.length == 0) continue;

      for (let index = 0; index < pins.length; index++) {
        const pin = pins[index];

        let point: Point;
        let size: Size;

        const horPinSize = { width: this.pinWidth, height: this.pinHeight };
        const vertPinSize = { width: this.pinHeight, height: this.pinWidth };

        switch (key) {
          case ComponentPosition.Left:
            point = { x: 0, y: this.pinHeight * index };
            size = horPinSize;
            break;
          case ComponentPosition.Right:
            point = {
              x: this.size.width - this.pinWidth,
              y: this.pinHeight * index,
            };
            size = horPinSize;
            break;
          case ComponentPosition.Top:
            point = {
              x:
                (this.pinSides.l.length > 0 ? this.pinWidth : 0) +
                this.pinHeight * index,
              y: 0,
            };
            size = vertPinSize;
            break;
          case ComponentPosition.Bottom:
            point = {
              x:
                (this.pinSides.l.length > 0 ? this.pinWidth : 0) +
                this.pinHeight * index,
              y: size.height - this.pinWidth,
            };
            size = vertPinSize;
            break;
        }

        const pinRect = this.createRect(point, size, pin.id);
        group.appendChild(pinRect);
      }
    }

    group.appendChild(rectContainer);

    return group;

    // const rotate = this.rotationAngle
    //   ? `rotate(${this.rotationAngle})`
    //   : undefined;
    // const translate = this.getTranslate(this.rotationAngle, this.size);
    // const transform = [translate, rotate].filter(Boolean).join(" ");
    // const labelCoords = this.getLabelCoords(
    //   this.rotationAngle,
    //   this.size,
    //   this.compDefinition?.label?.position,
    // );
    // const group = document.createElementNS(SVG_NS, "g");
    // const label = this.compDefinition.label;
    // if (label?.name) {
    //   const text = document.createElementNS(SVG_NS, "text");
    //   text.setAttribute("x", String(labelCoords.x));
    //   text.setAttribute("y", String(labelCoords.y));
    //   if (
    //     !label.position ||
    //     [LabelPosition.Top, LabelPosition.Bottom].includes(label.position)
    //   ) {
    //     text.setAttribute("text-anchor", "middle");
    //   }
    //   if (labelCoords.direction) {
    //     text.setAttribute("direction", labelCoords.direction);
    //   }
    //   text.textContent = this.showCompIdInsteadLabel
    //     ? this.compDefinition.id
    //     : label.name;
    //   group.appendChild(text);
    // }
    // const innerGroup = document.createElementNS(SVG_NS, "g");
    // if (transform) {
    //   innerGroup.setAttribute("transform", transform);
    // }
    // Array.from(this.svgTemplate.childNodes).forEach((node) =>
    //   innerGroup.appendChild(node.cloneNode(true)),
    // );
    // group.appendChild(innerGroup);
    // return group;
  }
}
