import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import type { Point } from "../geometry";
import svgString from "../../assets/dot.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class DotSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // A junction dot connects wires from four directions.
  // point 1 = left, point 2 = right, point 3 = top, point 4 = bottom.
  override get points(): Record<string, Point> {
    return {
      "1": { x: 0, y: this.size.height / 2 },
      "2": { x: this.size.width / 2, y: 0 },
      "3": { x: this.size.width, y: this.size.height / 2 },
      "4": { x: this.size.width / 2, y: this.size.height },
    };
  }
}
