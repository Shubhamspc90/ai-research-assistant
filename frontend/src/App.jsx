import { useEffect, useRef, useState } from "react";
import "./App.css";

import ChatSidebar from "./components/ChatSidebar";
import Login from "./components/Login";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const [message, setMessage] = useState("");
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversationRefreshKey, setConversationRefreshKey] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to the latest message when history or messages update.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversationMessages, loading]);

  // Load a saved conversation and its messages.
  const loadConversation = async (conversationId, token) => {
    const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
    setConversationMessages(conversation.messages ?? []);
  };

  // Create a new conversation.
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
      setConversationMessages([]);
      setError("");

      setConversationRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(err.message || "Unable to create a new conversation.");
    } finally {
      setLoading(false);
    }
  };

  // Select a previous conversation and load its saved messages.
  const handleConversationSelect = async (conversationId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    setMessage("");
    setConversationMessages([]);
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

  // Send a message and reload the persisted conversation history.
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
        throw new Error(errorData?.detail || "Failed to send message.");
      }

      setMessage("");

      // Fetch saved messages from the backend after the response is persisted.
      await loadConversation(activeConversationId, token);

      // Refresh the sidebar after the conversation changes.
      setConversationRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Put an example question into the input.
  const handleExampleClick = (example) => {
    setMessage(example);
    setError("");
    textareaRef.current?.focus();
  };

  // Log out and clear the current chat view.
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setActiveConversationId(null);
    setMessage("");
    setConversationMessages([]);
    setError("");
    setLoading(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const hasMessages = conversationMessages.length > 0;

  return (
    <div className="app-layout">
      <ChatSidebar
        onNewChat={handleNewChat}
        onConversationSelect={handleConversationSelect}
        onLogout={handleLogout}
        refreshKey={conversationRefreshKey}
      />

      <main className="chat-main">
        <div className="chat-app">
          {/* Header */}
          <header className="chat-header">
            <div className="header-brand">
              <div className="brand-icon" aria-hidden="true">
                AI
              </div>

              <div>
                <h1>AI Research Assistant</h1>
                <p>Research smarter with AI-powered tools</p>
              </div>
            </div>

            <div className="connection-status">
              <span className="status-dot" aria-hidden="true" />
              <span>Assistant ready</span>
            </div>
          </header>

          {/* Conversation area */}
          <section
            className={`chat-content${hasMessages ? "" : " chat-empty"}`}
            aria-live="polite"
          >
            {hasMessages ? (
              <div className="message-list">
                {conversationMessages.map((item, index) => {
                  const isUser = item.role === "user";

                  return (
                    <div
                      key={item.id ?? `${item.role}-${index}`}
                      className={`message-row ${
                        isUser ? "user-row" : "assistant-row"
                      }`}
                    >
                      {!isUser && (
                        <div
                          className="message-avatar assistant-avatar"
                          aria-hidden="true"
                        >
                          AI
                        </div>
                      )}

                      <div
                        className={`message-bubble ${
                          isUser ? "user-bubble" : "assistant-bubble"
                        }`}
                      >
                        <div className="message-author">
                          {isUser ? "You" : "Research Assistant"}
                        </div>

                        <div className="message-text">{item.content}</div>
                      </div>

                      {isUser && (
                        <div
                          className="message-avatar user-avatar"
                          aria-hidden="true"
                        >
                          You
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="message-row assistant-row">
                    <div
                      className="message-avatar assistant-avatar"
                      aria-hidden="true"
                    >
                      AI
                    </div>

                    <div className="message-bubble assistant-bubble">
                      <div className="message-author">
                        Research Assistant
                      </div>

                      <div className="typing-indicator" role="status">
                        <span />
                        <span />
                        <span />
                        <span className="typing-label">Researching...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            ) : loading ? (
              <div className="welcome-screen">
                <div className="welcome-icon" aria-hidden="true">
                  <span>✦</span>
                </div>

                <h2>Getting things ready...</h2>

                <p>
                  Loading your conversation. Your saved messages will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="welcome-screen">
                <div className="welcome-icon" aria-hidden="true">
                  <span>✦</span>
                </div>

                <h2>
                  {activeConversationId
                    ? "What would you like to research?"
                    : "Your research starts here"}
                </h2>

                <p>
                  Ask a question, explore a topic, or choose a suggestion below
                  to get started with your AI Research Assistant.
                </p>

                <div className="example-grid">
                  <button
                    className="example-card"
                    type="button"
                    disabled={!activeConversationId}
                    onClick={() =>
                      handleExampleClick("Research the latest AI trends")
                    }
                  >
                    <span>Research the latest AI trends</span>
                    <span className="example-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>

                  <button
                    className="example-card"
                    type="button"
                    disabled={!activeConversationId}
                    onClick={() =>
                      handleExampleClick("Explain PostgreSQL and pgvector")
                    }
                  >
                    <span>Explain PostgreSQL and pgvector</span>
                    <span className="example-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>

                  <button
                    className="example-card"
                    type="button"
                    disabled={!activeConversationId}
                    onClick={() =>
                      handleExampleClick("Find information about Python")
                    }
                  >
                    <span>Find information about Python</span>
                    <span className="example-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>

                  <button
                    className="example-card"
                    type="button"
                    disabled={!activeConversationId}
                    onClick={() =>
                      handleExampleClick("Compare popular AI research tools")
                    }
                  >
                    <span>Compare popular AI research tools</span>
                    <span className="example-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Error message */}
          {error && (
            <div className="chat-error" role="alert">
              <span>{error}</span>

              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}

          {/* Message composer */}
          <footer className="composer-area">
            <form className="chat-composer" onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={
                  activeConversationId
                    ? "Message your research assistant..."
                    : "Click + New Chat or select a conversation first..."
                }
                rows={2}
                disabled={loading || !activeConversationId}
                aria-label="Message your research assistant"
              />

              <button
                className="send-button"
                type="submit"
                aria-label="Send message"
                disabled={
                  loading || !message.trim() || !activeConversationId
                }
              >
                {loading ? "…" : "↑"}
              </button>
            </form>

            <p className="composer-hint">
              Press Enter to send · Shift + Enter for a new line
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;