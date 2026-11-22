import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import svgString from "../../assets/terminal.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class TerminalSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }
}
