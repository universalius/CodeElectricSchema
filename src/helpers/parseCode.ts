import {
  ComponentType,
  ConnectionOrientation,
  LabelPosition,
  Orientation,
  type ElecComponentDefinition,
  type Connection,
  type ConnectionLine,
  type Label,
  type ConnectionsBlock,
} from "../types/ElecComponentDefinition";

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
  components: ElecComponentDefinition[];
  connectionsBlocks: ConnectionsBlock[];
} => {
  const components = parseComponents(definitionsText);
  const connectionsBlocks = parseConnections(connectionsText);
  return { components, connectionsBlocks };
};

export const parseComponents = (text: string): ElecComponentDefinition[] => {
  const lines = text
    .split(";")
    .filter((line) => line.trim() !== "")
    .map((line) => line.trim().replace(";", ""));

  const components: ElecComponentDefinition[] = [];
  // console.log("Parsing component lines:", lines);

  for (const line of lines) {
    const [idStr, labelStr, orientationStr] = line.split(" ");
    const id = idStr;
    const type = parseComponentType(idStr);

    const component: ElecComponentDefinition = {
      id,
      type,
      label: labelStr ? parseLabel(labelStr) : undefined,
      orientation: orientationStr ? (orientationStr as Orientation) : undefined,
    };

    components.push(component);
  }
  return components;
};

export const parseConnections = (text: string): ConnectionsBlock[] => {
  const textLines = text
    .split(";\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.trim().replace(";", ""));

  const connectionsBlocks: Array<ConnectionsBlock> = [];

  let connections: Connection[] = [];
  let blockPosition: ConnectionOrientation;
  for (const textLine of textLines) {
    if (textLine.startsWith("---")) {
      connectionsBlocks.push({
        connections,
        position: blockPosition,
      });
      blockPosition = getBlockPosition(textLine);
      connections = [];
      continue;
    }

    const parts = textLine.split(" ");
    const [fromId, fromPoint] = parts[0].split("-");
    const [toId, toPoint] = parts[parts.length - 1].split("-");

    const lineParts = parts.slice(1, parts.length - 1);

    const connection: Connection = {
      from: {
        componentId: fromId,
        pointId: parseInt(fromPoint),
      },
      to: {
        componentId: toId,
        pointId: parseInt(toPoint),
      },
      lines: parseConnectionLines(lineParts),
    };

    connections.push(connection);
  }

  if (connections.length) {
    connectionsBlocks.push({
      connections,
      position: blockPosition,
    });
  }

  return connectionsBlocks;
};

const parseComponentType = (typeStr: string): ComponentType => {
  const [name] = splitTextAndNumbers(typeStr);
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
    case "Dot":
      return ComponentType.Dot;
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
  return Object.values(ConnectionOrientation).includes(
    value as ConnectionOrientation,
  );
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

const getBlockPosition = (text: string): ConnectionOrientation => {
  if (text.includes(ConnectionOrientation.Up)) return ConnectionOrientation.Up;

  if (text.includes(ConnectionOrientation.Down))
    return ConnectionOrientation.Down;

  if (text.includes(ConnectionOrientation.Left))
    return ConnectionOrientation.Left;

  if (text.includes(ConnectionOrientation.Right))
    return ConnectionOrientation.Right;

  return undefined;
};
