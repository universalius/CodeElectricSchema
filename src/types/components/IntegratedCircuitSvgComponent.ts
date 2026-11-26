import {
  ComponentPosition,
  type ElecComponentDefinition,
  type Pin,
} from "../ElecComponentDefinition";

import { BaseSvgComponent, SVG_NS } from "./BaseSvgComponent";
import type { Point, Size } from "../geometry";
import {
  createText,
  createRect,
  createLine,
} from "../../helpers/svgElementsHelpers";

export class IntegratedCircuitSvgComponent extends BaseSvgComponent {
  readonly pinHeight = 20;
  readonly pinWidth = 40;
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
    // const halfPinHeight = this.pinHeight / 2;
    const points: Record<string, Point> = {};
    this.compDefinition.pins.forEach((p) => {
      const pinLine = this.svgComponent.querySelector<SVGLineElement>(
        `[id="line-${p.id}"]`,
      );

      // const pinRect = this.svgComponent.querySelector<SVGRectElement>(
      //   `[id="line-${p.id}"]`,
      // );
      // let point;
      // switch (p.position) {
      //   case ComponentPosition.Left:
      //     point = {
      //       x: pinRect.x.baseVal.value,
      //       y: pinRect.y.baseVal.value + halfPinHeight,
      //     };
      //     break;
      //   case ComponentPosition.Right:
      //     point = {
      //       x: pinRect.x.baseVal.value + this.pinWidth,
      //       y: pinRect.y.baseVal.value + halfPinHeight,
      //     };
      //     break;
      //   case ComponentPosition.Top:
      //     point = {
      //       x: pinRect.x.baseVal.value + halfPinHeight,
      //       y: pinRect.y.baseVal.value,
      //     };
      //     break;
      //   case ComponentPosition.Bottom:
      //     point = {
      //       x: pinRect.x.baseVal.value + halfPinHeight,
      //       y: pinRect.y.baseVal.value + this.pinWidth,
      //     };
      //     break;
      // }

      points[p.id] = {
        x: pinLine.x1.baseVal.value,
        y: pinLine.y1.baseVal.value,
      };
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

    const topPinHeight = t.length ? this.pinWidth : 0;
    const bottomPinHeight = b.length ? this.pinWidth : 0;
    const topBottomPinsHeight =
      topPinHeight + bottomPinHeight + this.emptyHeight;
    const horPinsHeight = horPinsCount * this.pinHeight;
    const height =
      horPinsHeight > topBottomPinsHeight ? horPinsHeight : topBottomPinsHeight;
    return {
      height,
      width:
        (l.length ? this.pinWidth : 0) +
        (vertPinsCount ? vertPinsCount * this.pinHeight : this.emptyWidth) +
        (r.length ? this.pinWidth : 0),
    };
  }

  override buildSvgComponent(): SVGGElement {
    const group = document.createElementNS(SVG_NS, "g");
    const rectContainer = createRect({ x: 0, y: 0 }, this.size);
    group.appendChild(rectContainer);

    for (const [key, pins] of Object.entries(this.pinSides)) {
      if (pins.length == 0) continue;

      for (let index = 0; index < pins.length; index++) {
        const pin = pins[index];
        const { point, size } = this.calcPinRectPosition(
          index,
          key as ComponentPosition,
        );
        // const pinRect = createRect(point, size, pin.id);
        // group.appendChild(pinRect);

        if (pin.label) {
          group.appendChild(this.createPinText(point, size, pin));

          const pinLine = this.createPinLine(point, size, pin);
          group.appendChild(pinLine.line);
          group.appendChild(this.createPinNumber(pinLine.point, pin));
        }
      }
    }

    if (this.compDefinition.label?.name) {
      group.appendChild(this.getLabelText());
    }

    return group;
  }

  calcPinRectPosition(
    index: number,
    key: ComponentPosition,
  ): { point: Point; size: Size } {
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
          y: this.size.height - this.pinWidth,
        };
        size = vertPinSize;
        break;
    }

    return { point, size };
  }

  createPinText(point: Point, size: Size, pin: Pin) {
    const pinTextPoint = {
      x: point.x + size.width / 2,
      y: point.y + size.height / 2,
    };
    const pinText = createText(pinTextPoint, pin.label, {
      direction: pin.position === ComponentPosition.Right ? "rtl" : undefined,
      transform: [ComponentPosition.Top, ComponentPosition.Bottom].includes(
        pin.position,
      )
        ? `rotate(-90, ${pinTextPoint.x}, ${pinTextPoint.y})`
        : undefined,
    });

    return pinText;
  }

  createPinLine(
    point: Point,
    size: Size,
    pin: Pin,
  ): {
    line: SVGLineElement;
    point: Point;
  } {
    const lineWidth = 15;
    let p1: Point;
    let p2: Point;

    switch (pin.position) {
      case ComponentPosition.Left:
      case ComponentPosition.Right:
        p1 = {
          x:
            pin.position === ComponentPosition.Left
              ? point.x
              : point.x + size.width,
          y: point.y + size.height / 2,
        };

        const width =
          pin.position === ComponentPosition.Left ? -lineWidth : lineWidth;

        p2 = { x: p1.x + width, y: p1.y };
        break;
      case ComponentPosition.Top:
      case ComponentPosition.Bottom:
        p1 = {
          x: point.x + size.width / 2,
          y:
            pin.position === ComponentPosition.Top
              ? point.y
              : point.y + size.height,
        };

        const height =
          pin.position === ComponentPosition.Top ? -lineWidth : lineWidth;

        p2 = {
          x: p1.x,
          y: p1.y + height,
        };
        break;
    }

    const line = createLine(p1, p2, pin.id);

    return { line, point: p1 };
  }

  createPinNumber(point: Point, pin: Pin) {
    let direction = "rtl";
    let dominantBaseline = "auto";
    let textAnchor = "start";
    let shiftPoint: Point;
    const shift = 5;

    switch (pin.position) {
      case ComponentPosition.Left:
        shiftPoint = {
          x: -shift,
          y: -shift,
        };
        break;
      case ComponentPosition.Right:
        direction = "ltr";
        shiftPoint = {
          x: shift,
          y: -shift,
        };
        break;
      case ComponentPosition.Top:
        shiftPoint = {
          x: -shift,
          y: -shift,
        };
        break;
      case ComponentPosition.Bottom:
        dominantBaseline = "hanging";
        shiftPoint = {
          x: -shift,
          y: shift,
        };
        break;
    }

    return createText(point, pin.id, {
      direction,
      dominantBaseline,
      textAnchor,
      transform: `translate(${shiftPoint.x}, ${shiftPoint.y})`,
    });
  }
}
