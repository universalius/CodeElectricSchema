import svg from "../../assets/resistor.svg?raw";
import {
  getRotation,
  parseSvgString,
  getTranslate,
  getLabelCoords,
} from "../helpers/componentPositionHelpers";
import { type BaseElecComponent } from "../types/BaseElecComponent";

export const BaseSvgComponent = ({
  component,
}: {
  component: BaseElecComponent;
}) => {
  const rotationAngle = getRotation(component?.orientation);
  const svgElement = parseSvgString(svg);

  const width = svgElement.width.baseVal.value;
  const height = svgElement.height.baseVal.value;
  const rotate = rotationAngle ? `rotate(${rotationAngle})` : undefined;
  const translate = getTranslate(rotationAngle, width, height);

  const transform = [translate, rotate].filter(Boolean).join(" ");

  const labelCoords = getLabelCoords(
    rotationAngle,
    width,
    height,
    component?.label?.position,
  );

  return (
    <g>
      {component?.label?.name && (
        <text
          x={labelCoords.x}
          y={labelCoords.y}
          direction={labelCoords.direction}
        >
          {component.label.name}
        </text>
      )}
      <g
        transform={transform}
        dangerouslySetInnerHTML={{ __html: svgElement.innerHTML }}
      />
    </g>
  );
};
