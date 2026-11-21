import type { ElecComponentDefinition, Point } from "./ElecComponentDefinition";
import svgString from "../assets/led.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class LedSvgContainer extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // The LED body is a 26x30 diode (like diode.svg) with emitted-light arrows
  // on the right, so the cathode bar sits at x = 26, not at the right edge.
  // point 1 = anode (triangle base, left edge), point 2 = cathode (bar).
  override get points(): Array<Point> {
    return [
      { x: 0, y: this.height / 2 },
      { x: 26, y: this.height / 2 },
    ];
  }
}
