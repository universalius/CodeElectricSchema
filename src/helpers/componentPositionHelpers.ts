import { LabelPosition, Orientation } from "../types/BaseElecComponent";

export const getRotation = (orientation: Orientation): number => {
  if (!orientation || orientation === Orientation.Horizontal) {
    return undefined;
  }

  if (
    orientation === Orientation.Vertical ||
    orientation === Orientation.Rot90
  ) {
    return 90;
  }

  if (orientation === Orientation.Rot180) {
    return 180;
  }

  if (orientation === Orientation.Rot270) {
    return 270;
  }

  if (orientation === Orientation.Rot360) {
    return 360;
  }

  return undefined;
};

export const getTranslate = (
  angle: number,
  width: number,
  height: number,
): string => {
  if (angle === 90) {
    return `translate(${height}, 0)`;
  }

  if (angle === 180) {
    return `translate(${width}, ${height})`;
  }

  if (angle === 270) {
    return `translate(0, ${width})`;
  }

  return undefined;
};

export const parseSvgString = (svgString: string): SVGSVGElement => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // Check for XML parsing errors
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`Failed to parse SVG: ${parserError.textContent}`);
  }

  return doc.documentElement as unknown as SVGSVGElement;
};

const labelHeight = 36;

export const getLabelCoords = (
  angle: number,
  componentWidth: number,
  componentHeight: number,
  labelPosition: LabelPosition,
): { x: number; y: number; direction?: string } => {
  let width = componentWidth;
  let height = componentHeight;

  if (angle == 90 || angle == 270) {
    width = componentHeight;
    height = componentWidth;
  }

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
