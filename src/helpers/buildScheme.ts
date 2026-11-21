import {
  ComponentType,
  type BaseElecComponent,
  type Connection,
} from "../types/BaseElecComponent";

export const buildScheme = ({
  components,
  connections,
}: {
  components: BaseElecComponent[];
  connections: Connection[];
}) => {
  //const vccs = components.filter((c) => c.type === ComponentType.Vcc);
};
