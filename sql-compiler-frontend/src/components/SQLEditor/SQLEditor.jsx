import React, { useState } from "react";
import AceEditor from "react-ace";
import axios from "axios";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-solarized_light";
import "./SQLEditor.css";

const SQLEditor = ({ onExecute }) => { 
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const handleExecute = () => {
    axios
      .post("http://localhost:3001/execute-query", { query })
      .then((response) => {
        setResult(response.data.data);
        setMessage(response.data.message);
        setError(null);
        
        if (onExecute) {
          onExecute(query); // Trigger data refresh in the parent component
        }
      })
      .catch((error) => {
        setError(
          error.response ? error.response.data.error : "Error executing query"
        );
        setMessage("");
        setResult([]);
      });
  };

  const renderTable = (data) => (
    <table className="results-table">
      <thead>
        <tr>
          {Object.keys(data[0] || {}).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, idx) => (
              <td key={idx}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <AceEditor
        mode="sql"
        theme="github"
        value={query}
        onChange={setQuery}
        name="ace-sql-editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 3,
        }}
        style={{ height: "45vh", width: "100%" }}
      />
      <button onClick={handleExecute} className="execute-button">
        Execute
      </button>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      {result.length > 0 && (
        <>
          <h2>Query Result</h2>
          {renderTable(result)}
        </>
      )}
    </div>
  );
};

export default SQLEditor;
