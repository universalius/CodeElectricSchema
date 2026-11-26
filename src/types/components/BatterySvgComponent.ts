import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import svgString from "../../assets/battery.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class BatterySvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }
}
