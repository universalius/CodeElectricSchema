import type { ElecComponentDefinition } from "./ElecComponentDefinition";
import svgString from "../assets/resistor.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class ResistorSvgContainer extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // override get points(): Array<Point> {
  // }
}
