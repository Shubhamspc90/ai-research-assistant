
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function ChatSidebar({
    onNewChat,
    onConversationSelect,
    onLogout,
    refreshKey,
}) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const token = localStorage.getItem("access_token");

        const request = token
            ? fetch(`${API_URL}/conversations`, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }).then(async (response) => {
                  if (!response.ok) {
                      throw new Error("Failed to load conversations.");
                  }

                  return response.json();
              })
            : Promise.reject(
                  new Error("Please log in to view your conversations.")
              );

        request
            .then((data) => {
                if (!cancelled) {
                    setConversations(data);
                    setError("");
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load conversations."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    return (
        <aside className="chat-sidebar">
            <div className="sidebar-header">
                <h2>AI Research Assistant</h2>

                <button
                    type="button"
                    className="new-chat-button"
                    onClick={onNewChat}
                >
                    + New Chat
                </button>

                <button
                    type="button"
                    className="logout-button"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>

            <div className="conversation-list">
                <h3>Recent Conversations</h3>

                {loading && (
                    <p className="sidebar-status">
                        Loading conversations...
                    </p>
                )}

                {error && (
                    <p className="sidebar-error" role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && conversations.length === 0 && (
                    <p className="sidebar-status">
                        No conversations yet.
                    </p>
                )}

                {!loading &&
                    conversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            type="button"
                            className="conversation-item"
                            onClick={() =>
                                onConversationSelect(conversation.id)
                            }
                        >
                            <span className="conversation-title">
                                {conversation.title}
                            </span>

                            <span className="conversation-date">
                                {new Date(
                                    conversation.updated_at
                                ).toLocaleDateString()}
                            </span>
                        </button>
                    ))}
            </div>
        </aside>
    );
}

export default ChatSidebar;
