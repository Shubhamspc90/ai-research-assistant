
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function getErrorMessage(errorData, fallback) {
  const detail = errorData?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.msg || "Invalid input."
      )
      .join(" ");
  }

  return fallback;
}

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRegistering = mode === "register";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    if (isRegistering) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: normalizedEmail,
            password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            getErrorMessage(
              errorData,
              "Unable to create your account. Please try again."
            )
          );
        }

        setMode("login");
        setName("");
        setEmail(normalizedEmail);
        setPassword("");
        setConfirmPassword("");
        setSuccess(
          "Account created successfully. You can now log in."
        );
        return;
      }

      const formData = new URLSearchParams();
      formData.append("username", normalizedEmail);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          getErrorMessage(
            errorData,
            "Invalid email or password."
          )
        );
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem("access_token", data.access_token);
      onLogin();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>AI Research Assistant</h1>

        <p>
          {isRegistering
            ? "Create an account to get started"
            : "Login to continue"}
        </p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="login-success" role="status">
            {success}
          </div>
        )}

        {isRegistering && (
          <>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={100}
              required
              disabled={loading}
            />
          </>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={
            isRegistering
              ? "Create a password (minimum 8 characters)"
              : "Enter your password"
          }
          autoComplete={
            isRegistering ? "new-password" : "current-password"
          }
          minLength={isRegistering ? 8 : undefined}
          required
          disabled={loading}
        />

        {isRegistering && (
          <>
            <label htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={loading}
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? isRegistering
              ? "Creating account..."
              : "Logging in..."
            : isRegistering
              ? "Create Account"
              : "Login"}
        </button>

        <div className="auth-switch-container">
          <span>
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            className="auth-switch"
            type="button"
            disabled={loading}
            onClick={() =>
              switchMode(isRegistering ? "login" : "register")
            }
          >
            {isRegistering ? "Login" : "Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
