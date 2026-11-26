import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import svgString from "../../assets/general_motor.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class GeneralMotorSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }
}
