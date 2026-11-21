import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import { parseCode } from "./helpers/parseCode";
import {
  ComponentType,
  LabelPosition,
  Orientation,
  type ElecComponentDefinition,
} from "./types/ElecComponentDefinition";
import { buildSchemeSvg } from "./helpers/buildScheme";

function App() {
  const [count, setCount] = useState(0);

  const testComponents = `
Vcc1 5V; 
Gnd1 -;
Vcc2 5V; 
Gnd2 -;
D1 D1;
D2 D2;
Switch1 K1;
Vcc3 5V; 
Gnd3 -;
Vcc4 5V; 
Gnd4 -;
C1 C1-l vert;`;

  const testConnections = `
Vcc1-2 - Dot1-1;
Dot1-2 - D1-1;
D1-2 - Dot2-1;
Dot2-1 - Switch1-1;
Switch1-2 - Vcc3-1;
Dot1-4 | C1-1;
C1-2 | Dot3-2;

Gnd1-1 - Dot3-1;

Vcc2-2 - D2-1;
D2-2 - | Dot2-4;

Gnd2-2 - Dot5-1;
Dot5-2 | Dot3-4;
Dot5-3 - Gnd4-1;
`;

  const testComponents1 = `
Vcc1 5V; 
R1 R1;
D1 D1;
Vcc2 Out_5V;
Dot1;
Vcc3 5V;
`;

  const testConnections1 = `
Vcc1-2 > Dot1-1;
Dot1-4 v 40 < Vcc3-2;
Dot1-3 > R1-1;
R1-2 > D1-1;
D1-2 > Vcc2-1;
`;

  const result = parseCode(testComponents1, testConnections1);

  // console.log("Parsed Result:", result);

  const diode: ElecComponentDefinition = {
    label: { name: "D1", position: LabelPosition.Bottom },
    id: "D1",
    type: ComponentType.D,
    orientation: Orientation.Vertical,
  };

  const resistor: ElecComponentDefinition = {
    label: { name: "R1", position: LabelPosition.Right },
    id: "R1",
    type: ComponentType.R,
    orientation: Orientation.Vertical,
  };

  const testSvg = buildSchemeSvg(result.components, result.connections);

  return (
    <>
      {/* <section id="center">
        <svg
          width="300"
          height="300"
          viewBox="-75 -75 150 150"
          style={{ color: "black", backgroundColor: "pink" }}
        >
          <Diode component={diode} />
          <Resistor component={resistor} />
        </svg>
      </section> */}

      <div
        ref={(node) => {
          if (node && testSvg) {
            node.replaceChildren(testSvg);
          }
        }}
      />

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
