import type { BaseSvgComponent } from "../types/BaseSvgContainer";
import {
  type ElecComponentDefinition,
  ComponentType,
} from "../types/ElecComponentDefinition";
import { CapacitorSvgContainer } from "../types/CapacitorSvgContainer";
import { DiodeSvgContainer } from "../types/DiodeSvgContainer";
import { DotSvgContainer } from "../types/DotSvgContainer";
import { LedSvgContainer } from "../types/LedSvgContainer";
import { ResistorSvgContainer } from "../types/ResistorSvgContainer";
import { SwitchSvgContainer } from "../types/SwitchSvgContainer";
import { TerminalSvgContainer } from "../types/TerminalSvgContainer";

export const createSvgContainer = (
  component: ElecComponentDefinition,
  showCompIdInsteadLabel = false,
): BaseSvgComponent => {
  let container: BaseSvgComponent;

  switch (component.type) {
    case ComponentType.Vcc:
    case ComponentType.Gnd:
      container = new TerminalSvgContainer(component);
      break;
    case ComponentType.D:
      container = new DiodeSvgContainer(component);
      break;
    case ComponentType.R:
      container = new ResistorSvgContainer(component);
      break;
    case ComponentType.C:
      container = new CapacitorSvgContainer(component);
      break;
    case ComponentType.LED:
      container = new LedSvgContainer(component);
      break;
    case ComponentType.Switch:
      container = new SwitchSvgContainer(component);
      break;
    case ComponentType.Dot:
      container = new DotSvgContainer(component);
      break;
    default:
      throw new Error(`Unsupported component type: ${component.type}`);
  }

  container.showCompIdInsteadLabel = showCompIdInsteadLabel;
  return container;
};
