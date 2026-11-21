import type { ElecComponentDefinition } from "./ElecComponentDefinition";
import svgString from "../assets/switch.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class SwitchSvgContainer extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // The default `points` (left-middle / right-middle) match the outer edges of
  // the two contact circles (x = 0 and x = 30), so no override is needed.
}
