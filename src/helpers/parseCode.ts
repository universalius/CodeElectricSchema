import {
  ComponentType,
  ConnectionOrientation,
  LabelPosition,
  Orientation,
  type BaseElecComponent,
  type Connection,
  type ConnectionLine,
  type Label,
} from "../types/BaseElecComponent";

/**
 * Splits a string containing text and numbers into an array of text and numeric segments.
 * E.g., "R1" => ["R", "1"], "Switch12" => ["Switch", "12"]
 */
export const splitTextAndNumbers = (input: string): string[] => {
  return input.match(/[a-zA-Z]+|\d+/g) ?? [];
};

export const parseCode = (
  definitionsText: string,
  connectionsText: string,
): {
  components: BaseElecComponent[];
  connections: Connection[];
} => {
  const components = parseComponents(definitionsText);
  const connections = parseConnections(connectionsText);
  return { components, connections };
};

export const parseComponents = (text: string): BaseElecComponent[] => {
  const lines = text
    .split(";")
    .filter((line) => line.trim() !== "")
    .map((line) => line.trim().replace(";", ""));

  const components: BaseElecComponent[] = [];
  // console.log("Parsing component lines:", lines);

  for (const line of lines) {
    const [idStr, labelStr, orientationStr] = line.split(" ");
    const id = idStr;
    const type = parseComponentType(idStr);

    const component: BaseElecComponent = {
      id,
      type,
      label: labelStr ? parseLabel(labelStr) : undefined,
      orientation: orientationStr ? (orientationStr as Orientation) : undefined,
    };

    components.push(component);
  }
  return components;
};

export const parseConnections = (text: string): Connection[] => {
  const textLines = text
    .split(";\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.trim().replace(";", ""));

  const connections: Connection[] = [];
  for (const textLine of textLines) {
    const parts = textLine.split(" ");
    const [fromId, fromPoint] = parts[0].split("-");
    const [toId, toPoint] = parts[parts.length - 1].split("-");

    const lineParts = parts.slice(1, parts.length - 1);

    const connection: Connection = {
      from: {
        id: fromId,
        point: parseInt(fromPoint),
      },
      to: {
        id: toId,
        point: parseInt(toPoint),
      },
      lines: parseConnectionLines(lineParts),
    };

    connections.push(connection);
  }
  return connections;
};

const parseComponentType = (typeStr: string): ComponentType => {
  const [name, index] = splitTextAndNumbers(typeStr);
  switch (name) {
    case "R":
      return ComponentType.R;
    case "C":
      return ComponentType.C;
    case "Vcc":
      return ComponentType.Vcc;
    case "Gnd":
      return ComponentType.Gnd;
    case "Switch":
      return ComponentType.Switch;
    case "Terminal":
      return ComponentType.Terminal;
    case "D":
      return ComponentType.D;
    case "PD":
      return ComponentType.PD;
    case "LED":
      return ComponentType.LED;
    case "MCU":
      return ComponentType.MCU;
    case "Pin":
      return ComponentType.Pin;
    default:
      throw new Error(`Unknown component type: ${typeStr}`);
  }
};

const parseLabel = (labelStr: string): Label => {
  const [name, position] = labelStr.trim().split("-");
  return {
    name,
    position: position ? (position as LabelPosition) : undefined,
  };
};

const isConnectionOrientation = (value: string): boolean => {
  return (value as ConnectionOrientation) !== undefined;
};

const parseConnectionLines = (parts: string[]): ConnectionLine[] => {
  if (parts.length === 0) {
    throw new Error("Connection line string is empty");
  }

  if (parts.length === 1) {
    return [
      {
        orientation: parts[0] as ConnectionOrientation,
      },
    ];
  }

  const lines: ConnectionLine[] = [];
  for (let i = 0; i < parts.length; i++) {
    const orientation = parts[i] as ConnectionOrientation;
    if (!isConnectionOrientation(orientation)) {
      throw new Error(`Invalid connection orientation: ${orientation}`);
    }

    const nextIndex = i + 1;
    if (nextIndex == parts.length) {
      lines.push({
        orientation,
      });
      break;
    }

    const nextPart = parts[nextIndex];
    if (isConnectionOrientation(nextPart)) {
      lines.push({
        orientation,
      });
    } else {
      const length = parseInt(nextPart);
      console.log("Next part is length:", nextPart, parts, i);
      lines.push({
        orientation,
        length,
      });
      i++; // Skip the next part since it's a length
    }
  }

  return lines;
};
