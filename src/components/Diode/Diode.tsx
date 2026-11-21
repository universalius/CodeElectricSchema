import svg from "../../assets/diode.svg?raw";
import {
  getRotation,
  parseSvgString,
  getTranslate,
} from "../../helpers/componentPositionHelpers";
import {
  LabelPosition,
  type BaseElecComponent,
} from "../../types/BaseElecComponent";

const labelHeight = 36;

const getLabelCoords = (
  width: number,
  height: number,
  labelPosition: LabelPosition,
): { x: number; y: number; direction?: string } => {
  if (labelPosition === LabelPosition.Top) {
    return { x: width / 2, y: 0 };
  }

  if (labelPosition === LabelPosition.Bottom) {
    return { x: width / 2, y: height + labelHeight / 2 };
  }

  if (labelPosition === LabelPosition.Left) {
    return { x: 0, y: height / 2 + labelHeight / 6, direction: "rtl" };
  }

  if (labelPosition === LabelPosition.Right) {
    return { x: width, y: height / 2 + labelHeight / 6 };
  }

  return { x: width / 2, y: 0 };
};

export const Diode = ({ component }: { component: BaseElecComponent }) => {
  const rotationAngle = getRotation(component?.orientation);
  const svgElement = parseSvgString(svg);

  const width = svgElement.width.baseVal.value;
  const height = svgElement.height.baseVal.value;
  const rotate = rotationAngle ? `rotate(${rotationAngle})` : undefined;
  const translate = getTranslate(rotationAngle, width, height);

  const transform = [translate, rotate].filter(Boolean).join(" ");

  const labelCoords = getLabelCoords(width, height, component?.label?.position);

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
