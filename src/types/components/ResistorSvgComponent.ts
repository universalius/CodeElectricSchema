import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import svgString from "../../assets/resistor.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class ResistorSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }
}
