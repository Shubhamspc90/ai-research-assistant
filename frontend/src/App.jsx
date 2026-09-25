import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userMessage = message.trim();

    if (!userMessage || loading) {
      return;
    }

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to the server.");
      }

      if (!res.body) {
        throw new Error("Streaming is not supported by the server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const eventData of events) {
          const line = eventData
            .split("\n")
            .find((line) => line.startsWith("data: "));

          if (!line) {
            continue;
          }

          const data = line.slice(6);

          try {
            const parsedData = JSON.parse(data);

            if (parsedData.type === "token") {
              setResponse(
                (previous) => previous + parsedData.content
              );
            } else if (parsedData.type === "error") {
              throw new Error(parsedData.message);
            } else if (parsedData.type === "done") {
              return;
            }
          } catch (parseError) {
            if (parseError instanceof SyntaxError) {
              console.error("Invalid SSE data:", data);
            } else {
              throw parseError;
            }
          }
        }
      }

      setMessage("");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setMessage(example);
    setResponse("");
    setError("");
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI Research Assistant</h1>
        <p>Research smarter with AI-powered tools</p>
      </header>

      <main className="main-content">
        <section className="hero">
          <h2>What would you like to research?</h2>
          <p>
            Ask a question, search the web, or use our AI-powered tools.
          </p>
        </section>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask anything..."
            rows="4"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? "Researching..." : "Send"}
          </button>
        </form>

        {error && (
          <section className="error-message">
            <strong>Error:</strong> {error}
          </section>
        )}

        {response && (
          <section className="response-section">
            <h3>Research Assistant</h3>

            <div className="response-box">
              {response}
            </div>
          </section>
        )}

        <section className="examples">
          <h3>Try an example</h3>

          <div className="example-list">
            <button
              type="button"
              onClick={() =>
                handleExampleClick("Research the latest AI trends")
              }
            >
              Research the latest AI trends
            </button>

            <button
              type="button"
              onClick={() =>
                handleExampleClick("Calculate GST on ₹50,000 at 18%")
              }
            >
              Calculate GST on ₹50,000 at 18%
            </button>

            <button
              type="button"
              onClick={() =>
                handleExampleClick("Find information about Python")
              }
            >
              Find information about Python
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;