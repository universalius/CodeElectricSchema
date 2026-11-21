import type { ElecComponentDefinition } from "./ElecComponentDefinition";
import svgString from "../assets/capacitor.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class CapacitorSvgContainer extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // The default `points` (left-middle / right-middle) already match the two
  // vertical plates at x = 0 and x = width, so no override is needed.
}
