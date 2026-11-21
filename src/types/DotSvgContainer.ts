import type { ElecComponentDefinition, Point } from "./ElecComponentDefinition";
import svgString from "../assets/dot.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class DotSvgContainer extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // A junction dot connects wires from four directions.
  // point 1 = left, point 2 = right, point 3 = top, point 4 = bottom.
  override get points(): Array<Point> {
    return [
      { x: 0, y: this.height / 2 },
      { x: this.width / 2, y: 0 },
      { x: this.width, y: this.height / 2 },
      { x: this.width / 2, y: this.height },
    ];
  }
}
