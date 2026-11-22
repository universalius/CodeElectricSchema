import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import svgString from "../../assets/diode.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class DiodeSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }
}
