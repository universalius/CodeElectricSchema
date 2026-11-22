import type { ElecComponentDefinition } from "../ElecComponentDefinition";
import type { Point } from "../geometry";
import svgString from "../../assets/ik_receiver_diod.svg?raw";
import { BaseSvgComponent } from "./BaseSvgComponent";

export class PhotodiodeSvgComponent extends BaseSvgComponent {
  constructor(component: ElecComponentDefinition) {
    super(svgString, component);
  }

  // The IR-receiver (photodiode) symbol draws the incoming-light arrows above
  // the diode triangle, so the diode body is vertically offset inside the
  // 30x49 viewBox. point 1 = anode (left edge of the triangle), point 2 =
  // cathode (the bar), both at the vertical centre of the body (y = 32.75).
  override get points(): Array<Point> {
    const y = this.height / 2 + 9;
    return [
      { x: 0, y },
      { x: this.width, y },
    ];
  }
}
