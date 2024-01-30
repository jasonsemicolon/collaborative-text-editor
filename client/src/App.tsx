import { FormEvent, useState } from "react";
import Paper from "./components/paper/Paper";
import TextEditor from "./components/textEditor/TextEditor";

// =============== Types ==============
type Page = "username" | "editor";

/**
 * App Component
 */
function App() {
  const [name, setName] = useState<string>("");
  const [page, setPage] = useState<Page>("username");
  const [error, setError] = useState<boolean>(false);

  function handleName(e: FormEvent<HTMLInputElement>) {
    let { target } = e;
    setError(false);
    setName((target as HTMLInputElement).value);
  }

  function handleStage() {
    if (name) {
      setPage("editor");
    } else {
      setError(true);
    }
  }

  return (
    <div>
      {page === "username" ? (
        <Paper>
          <input
            placeholder="Your Name"
            value={name}
            name="name"
            onChange={handleName}
            className={error ? "error" : ""}
          />
          <button onClick={handleStage}>Connect</button>
          {error && <div className="error-message">Name is Required</div>}
        </Paper>
      ) : (
        <TextEditor name={name} />
      )}
    </div>
  );
}

export default App;
