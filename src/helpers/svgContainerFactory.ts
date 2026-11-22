import {
  TerminalSvgComponent,
  DiodeSvgComponent,
  PhotodiodeSvgComponent,
  ResistorSvgComponent,
  CapacitorSvgComponent,
  LedSvgComponent,
  SwitchSvgComponent,
  DotSvgComponent,
} from "../types/components";
import type { BaseSvgComponent } from "../types/components/BaseSvgComponent";
import {
  type ElecComponentDefinition,
  ComponentType,
} from "../types/ElecComponentDefinition";

export const createSvgContainer = (
  component: ElecComponentDefinition,
  showCompIdInsteadLabel = false,
): BaseSvgComponent => {
  let container: BaseSvgComponent;

  switch (component.type) {
    case ComponentType.Vcc:
    case ComponentType.Gnd:
    case ComponentType.Terminal:
      container = new TerminalSvgComponent(component);
      break;
    case ComponentType.D:
      container = new DiodeSvgComponent(component);
      break;
    case ComponentType.PD:
      container = new PhotodiodeSvgComponent(component);
      break;
    case ComponentType.R:
      container = new ResistorSvgComponent(component);
      break;
    case ComponentType.C:
      container = new CapacitorSvgComponent(component);
      break;
    case ComponentType.LED:
      container = new LedSvgComponent(component);
      break;
    case ComponentType.Switch:
      container = new SwitchSvgComponent(component);
      break;
    case ComponentType.Dot:
      container = new DotSvgComponent(component);
      break;
    default:
      throw new Error(`Unsupported component type: ${component.type}`);
  }

  container.showCompIdInsteadLabel = showCompIdInsteadLabel;
  return container;
};
