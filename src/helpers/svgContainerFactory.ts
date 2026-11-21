import type { BaseSvgComponent } from "../types/BaseSvgContainer";
import {
  type ElecComponentDefinition,
  ComponentType,
} from "../types/ElecComponentDefinition";
import { DiodeSvgContainer } from "../types/DiodeSvgContainer";
import { ResistorSvgContainer } from "../types/ResistorSvgContainer";
import { VccSvgContainer } from "../types/VccSvgContainer";

export const createSvgContainer = (
  component: ElecComponentDefinition,
): BaseSvgComponent => {
  switch (component.type) {
    case ComponentType.Vcc:
      return new VccSvgContainer(component);
    case ComponentType.D:
      return new DiodeSvgContainer(component);
    case ComponentType.R:
      return new ResistorSvgContainer(component);
    default:
      throw new Error(`Unsupported component type: ${component.type}`);
  }
};
