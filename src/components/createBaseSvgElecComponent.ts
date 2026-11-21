// import svg from "../../assets/resistor.svg?raw";
// import {
//   getRotation,
//   parseSvgString,
//   getTranslate,
//   getLabelCoords,
// } from "../helpers/componentPositionHelpers";
// import { type ElecComponentDefinition } from "../types/ElecComponentDefinition";

// const SVG_NS = "http://www.w3.org/2000/svg" as const;

// export const createBaseSvgElecComponent = (
//   component: ElecComponentDefinition,
//   svgString: string,
// ): SVGGElement => {
//   const rotationAngle = getRotation(component?.orientation);
//   const svgElement = parseSvgString(svgString);

//   const width = svgElement.width.baseVal.value;
//   const height = svgElement.height.baseVal.value;
//   const rotate = rotationAngle ? `rotate(${rotationAngle})` : undefined;
//   const translate = getTranslate(rotationAngle, width, height);

//   const transform = [translate, rotate].filter(Boolean).join(" ");

//   const labelCoords = getLabelCoords(
//     rotationAngle,
//     width,
//     height,
//     component?.label?.position,
//   );

//   const group = document.createElementNS(SVG_NS, "g") as SVGGElement;

//   const label = component?.label;
//   if (label?.name) {
//     const text = document.createElementNS(SVG_NS, "text") as SVGTextElement;
//     text.setAttribute("x", String(labelCoords.x));
//     text.setAttribute("y", String(labelCoords.y));
//     if (labelCoords.direction) {
//       text.setAttribute("direction", labelCoords.direction);
//     }
//     text.textContent = label.name;
//     group.appendChild(text);
//   }

//   const innerGroup = document.createElementNS(SVG_NS, "g") as SVGGElement;
//   if (transform) {
//     innerGroup.setAttribute("transform", transform);
//   }
//   Array.from(svgElement.childNodes).forEach((node) =>
//     innerGroup.appendChild(node.cloneNode(true)),
//   );
//   group.appendChild(innerGroup);

//   return group;
// };
