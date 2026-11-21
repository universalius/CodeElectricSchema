import { useEffect, useState } from "react";
import "./App.css";
import { parseCode } from "./helpers/parseCode";
import { buildSchemeSvg } from "./helpers/buildScheme";
import {
  COMPONENTS_STORAGE_KEY,
  CONNECTIONS_STORAGE_KEY,
  readStored,
  saveStored,
} from "./helpers/storage";

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

function buildSvgMarkup(
  componentsText: string,
  connectionsText: string,
  showCompIdInsteadLabel: boolean,
): string {
  const { components, connections } = parseCode(
    componentsText,
    connectionsText,
  );
  return buildSchemeSvg(components, connections, { showCompIdInsteadLabel })
    .outerHTML;
}

function App() {
  const [componentsText, setComponentsText] = useState<string>(
    () => readStored(COMPONENTS_STORAGE_KEY) ?? INITIAL_COMPONENTS,
  );
  const [connectionsText, setConnectionsText] = useState<string>(
    () => readStored(CONNECTIONS_STORAGE_KEY) ?? INITIAL_CONNECTIONS,
  );
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showCompIdInsteadLabel, setshowCompIdInsteadLabel] =
    useState<boolean>(false);

  const renderScheme = (
    components: string,
    connections: string,
    showCompIdInsteadLabel: boolean,
  ) => {
    try {
      setSvgMarkup(
        buildSvgMarkup(components, connections, showCompIdInsteadLabel),
      );
      setError(null);
    } catch (e) {
      setSvgMarkup("");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  // Render once on mount (from localStorage if present, otherwise the example).
  useEffect(() => {
    renderScheme(componentsText, connectionsText, showCompIdInsteadLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOk = () => {
    saveStored(COMPONENTS_STORAGE_KEY, componentsText);
    saveStored(CONNECTIONS_STORAGE_KEY, connectionsText);
    renderScheme(componentsText, connectionsText, showCompIdInsteadLabel);
  };

  const handleshowCompIdInsteadLabelChange = (checked: boolean) => {
    setshowCompIdInsteadLabel(checked);
    renderScheme(componentsText, connectionsText, checked);
  };

  return (
    <div className="editor-shell">
      <label className="editor-field editor-field-side editor-components">
        <span>Components</span>
        <textarea
          value={componentsText}
          onChange={(e) => setComponentsText(e.target.value)}
          rows={45}
          spellCheck={false}
        />
      </label>

      <div className="editor">
        <h1>Electrical Scheme Editor</h1>

        <div className="editor-actions">
          <label className="editor-checkbox">
            <input
              type="checkbox"
              checked={showCompIdInsteadLabel}
              onChange={(e) =>
                handleshowCompIdInsteadLabelChange(e.target.checked)
              }
            />
            Show component ids
          </label>
        </div>

        {error && <p className="editor-error">{error}</p>}

        <div
          className="scheme"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      </div>

      <label className="editor-field editor-field-side">
        <span>Connections</span>
        <button type="button" onClick={handleOk}>
          Apply
        </button>
        <textarea
          value={connectionsText}
          onChange={(e) => setConnectionsText(e.target.value)}
          rows={40}
          spellCheck={false}
        />
      </label>
    </div>
  );
}

export default App;
