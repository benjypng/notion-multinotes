import { useState } from "react";

function App() {
  const [links, setLinks] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const combine = async () => {
    setResult(""); // Clear the result before a new request

    const pageNameRegex = /[a-f0-9]{32}/;
    const pageArray = links
      .split("\n")
      .filter((link: string) => link != "")
      .map((link) => {
        if (pageNameRegex.exec(link)) {
          return pageNameRegex.exec(link)![0];
        }
      });

    if (pageArray.length > 0) {
      for (const page of pageArray) {
        fetch("/api/" + page)
          .then((res) => res.json())
          .then((data) =>
            setResult((prevResult) => prevResult + "\n" + data.message),
          );
      }
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <>
      <div className="card">
        <h1>Notion Multi Notes</h1>
        <div>
          <textarea
            onChange={(e) => setLinks(e.target.value)}
            placeholder="Paste links here..."
            cols={100}
            rows={5}
          ></textarea>
          <div>
            <button className="combine-btn" onClick={combine}>
              Combine
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <button className="copy-btn" onClick={copy}>
              Copy
            </button>
            <textarea value={result} cols={120} rows={50} readOnly></textarea>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
