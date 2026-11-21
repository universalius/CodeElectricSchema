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
): BaseSvgComponent => {
  switch (component.type) {
    case ComponentType.Vcc:
      return new TerminalSvgContainer(component);
    case ComponentType.Gnd:
      return new TerminalSvgContainer(component);
    case ComponentType.D:
      return new DiodeSvgContainer(component);
    case ComponentType.R:
      return new ResistorSvgContainer(component);
    case ComponentType.C:
      return new CapacitorSvgContainer(component);
    case ComponentType.LED:
      return new LedSvgContainer(component);
    case ComponentType.Switch:
      return new SwitchSvgContainer(component);
    case ComponentType.Dot:
      return new DotSvgContainer(component);
    default:
      throw new Error(`Unsupported component type: ${component.type}`);
  }
};
