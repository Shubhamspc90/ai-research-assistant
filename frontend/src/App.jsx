import { useState } from "react";
import "./App.css";

import ChatSidebar from "./components/ChatSidebar";
import Login from "./components/Login";

const API_URL = "http://127.0.0.1:8000";

// Convert saved messages into readable text for the chat area.
const formatMessages = (messages = []) => {
  return messages
    .map((item) => {
      const role = item.role === "user" ? "You" : "Assistant";
      return `${role}:\n${item.content}`;
    })
    .join("\n\n");
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversationRefreshKey, setConversationRefreshKey] = useState(0);

  // Load a conversation and all its saved messages.
  const loadConversation = async (conversationId, token) => {
    const res = await fetch(
      `${API_URL}/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );


    if (res.status === 401) {
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!res.ok) {
      throw new Error("Failed to load conversation messages.");
    }

    const conversation = await res.json();

    setActiveConversationId(conversation.id);
    setResponse(formatMessages(conversation.messages ?? []));


  };

  // Create a new conversation in the backend.
  const handleNewChat = async () => {
    setError("");


    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Conversation",
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!res.ok) {
        throw new Error("Failed to create a new conversation.");
      }

      const conversation = await res.json();

      setActiveConversationId(conversation.id);
      setMessage("");
      setResponse("");
      setError("");

      // Refresh the sidebar so the new conversation appears.
      setConversationRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(err.message || "Unable to create a new conversation.");
    } finally {
      setLoading(false);
    }


  };

  // Select an existing conversation and display its saved messages.
  const handleConversationSelect = async (conversationId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setMessage("");
    setResponse("");
    setError("");
    setLoading(true);

    try {
      await loadConversation(conversationId, token);
    } catch (err) {
      setError(err.message || "Unable to load conversation.");
    } finally {
      setLoading(false);
    }


  };

  // Save the user's message and the AI response to the selected conversation.
  const handleSubmit = async (event) => {
    event.preventDefault();


    const userMessage = message.trim();

    if (!userMessage || loading) {
      return;
    }

    if (!activeConversationId) {
      setError("Please click + New Chat or select a conversation first.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/conversations/${activeConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Failed to send message."
        );
      }

      // Clear the input after the message is accepted.
      setMessage("");

      // Reload the conversation to display the complete saved history.
      await loadConversation(
        activeConversationId,
        token
      );

      // Refresh conversation ordering in the sidebar.
      setConversationRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }


  };

  // Put an example question into the input field.
  const handleExampleClick = (example) => {
    setMessage(example);
    setError("");
  };

  // Log out and remove the locally stored token.
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);


    setActiveConversationId(null);
    setMessage("");
    setResponse("");
    setError("");


  };

  // Show the login page when the user is not authenticated.
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (<div className="app-layout"> <ChatSidebar
    onNewChat={handleNewChat}
    onConversationSelect={handleConversationSelect}
    onLogout={handleLogout}
    refreshKey={conversationRefreshKey}
  />


    <div className="chat-main">
      <div className="app">
        <header className="header">
          <h1>AI Research Assistant</h1>
          <p>Research smarter with AI-powered tools</p>
        </header>

        <main className="main-content">
          <section className="hero">
            <h2>
              {activeConversationId
                ? "Continue your research"
                : "What would you like to research?"}
            </h2>

            <p>
              Ask a question, search the web, or use our AI-powered tools.
            </p>

            {activeConversationId && (
              <p>
                Conversation ID: {activeConversationId}
              </p>
            )}
          </section>

          <form className="chat-form" onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask anything..."
              rows="4"
              disabled={loading || !activeConversationId}
            />

            <button
              type="submit"
              disabled={
                loading ||
                !message.trim() ||
                !activeConversationId
              }
            >
              {loading ? "Researching..." : "Send"}
            </button>
          </form>

          {loading && (
            <p className="sidebar-status">
              Loading or processing your conversation...
            </p>
          )}

          {error && (
            <section className="error-message">
              <strong>Error:</strong> {error}
            </section>
          )}

          {response && (
            <section className="response-section">
              <h3>Conversation History</h3>
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
                disabled={loading || !activeConversationId}
                onClick={() =>
                  handleExampleClick("Research the latest AI trends")
                }
              >
                Research the latest AI trends
              </button>

              <button
                type="button"
                disabled={loading || !activeConversationId}
                onClick={() =>
                  handleExampleClick("Calculate GST on ₹50,000 at 18%")
                }
              >
                Calculate GST on ₹50,000 at 18%
              </button>

              <button
                type="button"
                disabled={loading || !activeConversationId}
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
    </div>
  </div>


  );
}

export default App;
