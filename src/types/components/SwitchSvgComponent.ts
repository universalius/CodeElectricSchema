import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import type { Point } from "../geometry";
import svgString from "../../assets/switch.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class SwitchSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  override get points(): Record<string, Point> {
    return {
      "1": { x: 0, y: this.size.height - 2 },
      "2": { x: this.size.width, y: this.size.height - 2 },
    };
  }
}
