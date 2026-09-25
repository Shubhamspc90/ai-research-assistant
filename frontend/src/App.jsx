import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    console.log("User message:", message);
    setMessage("");
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
          />

          <button type="submit">Send</button>
        </form>

        <section className="examples">
          <h3>Try an example</h3>

          <div className="example-list">
            <button
              type="button"
              onClick={() =>
                setMessage("Research the latest AI trends")
              }
            >
              Research the latest AI trends
            </button>

            <button
              type="button"
              onClick={() =>
                setMessage("Calculate GST on ₹50,000 at 18%")
              }
            >
              Calculate GST on ₹50,000 at 18%
            </button>

            <button
              type="button"
              onClick={() =>
                setMessage("Find information about Python")
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