import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import svgString from "../../assets/capacitor.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class CapacitorSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }
}
