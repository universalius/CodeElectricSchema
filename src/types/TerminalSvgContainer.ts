import type { ElecComponentDefinition } from "./ElecComponentDefinition";
import svgString from "../assets/terminal.svg?raw";
import { BaseSvgComponent } from "./BaseSvgContainer";

export class TerminalSvgContainer extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // override get points(): Array<Point> {
  //   if (this.rotationAngle === 0 || this.rotationAngle === 180) {
  //     return [
  //       { x: 0, y: this.height / 2 },
  //       { x: this.width, y: this.height / 2 },
  //     ];
  //   }

  //   return [
  //     { x: this.width / 2, y: 0 },
  //     { x: this.width / 2, y: this.height },
  //   ];
  // }
}
