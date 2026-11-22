import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import type { Point } from "../geometry";
import svgString from "../../assets/switch.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class SwitchSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  override get points(): Array<Point> {
    return [
      { x: 0, y: this.height - 2 },
      { x: this.width, y: this.height - 2 },
    ];
  }
}
