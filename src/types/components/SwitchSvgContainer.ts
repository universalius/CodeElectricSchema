import type {
  ElecComponentDefinition,
  Point,
} from "../ElecComponentDefinition";
import svgString from "../../assets/switch.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class SwitchSvgContainer extends BaseSvgComponent {
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
