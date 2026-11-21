import { useState } from "react";
import "./App.css";
import { parseCode } from "./helpers/parseCode";
import { buildSchemeSvg } from "./helpers/buildScheme";

const INITIAL_COMPONENTS = [
  "Vcc1 5V;",
  "R1 R1;",
  "D1 D1;",
  "C1 C1;",
  "LED1 LED1;",
  "Switch1 K1;",
].join("\n");

const INITIAL_CONNECTIONS = [
  "Vcc1-2 > R1-1;",
  "R1-2 > D1-1;",
  "D1-2 > C1-1;",
  "C1-2 > LED1-1;",
  "LED1-2 > Switch1-1;",
].join("\n");

function buildSvgMarkup(componentsText: string, connectionsText: string): string {
  const { components, connections } = parseCode(componentsText, connectionsText);
  return buildSchemeSvg(components, connections).outerHTML;
}

function App() {
  const [componentsText, setComponentsText] = useState(INITIAL_COMPONENTS);
  const [connectionsText, setConnectionsText] = useState(INITIAL_CONNECTIONS);
  const [svgMarkup, setSvgMarkup] = useState<string>(() =>
    buildSvgMarkup(INITIAL_COMPONENTS, INITIAL_CONNECTIONS),
  );
  const [error, setError] = useState<string | null>(null);

  const handleOk = () => {
    try {
      setSvgMarkup(buildSvgMarkup(componentsText, connectionsText));
      setError(null);
    } catch (e) {
      setSvgMarkup("");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="editor">
      <h1>Electrical Scheme Editor</h1>

      <div className="editor-grid">
        <label className="editor-field">
          <span>Components</span>
          <textarea
            value={componentsText}
            onChange={(e) => setComponentsText(e.target.value)}
            rows={10}
            spellCheck={false}
          />
        </label>

        <label className="editor-field">
          <span>Connections</span>
          <textarea
            value={connectionsText}
            onChange={(e) => setConnectionsText(e.target.value)}
            rows={10}
            spellCheck={false}
          />
        </label>
      </div>

      <button type="button" onClick={handleOk}>
        Ok
      </button>

      {error && <p className="editor-error">{error}</p>}

      <div
        className="scheme"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
}

export default App;
