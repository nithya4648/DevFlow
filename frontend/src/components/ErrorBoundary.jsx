import React from "react";

/**
 * ErrorBoundary — catches render errors anywhere in the child tree,
 * logs the full error + component stack to the console, and renders
 * a visible fallback instead of a blank page.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null, expanded: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Full stack trace visible in DevTools console
    console.error(
      "[ErrorBoundary] Caught a render error:\n",
      error,
      "\nComponent stack:\n",
      info?.componentStack
    );
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null, expanded: false });
  };

  render() {
    const { hasError, error, info, expanded } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) return children;

    // Allow a custom fallback prop to be passed
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        style={{
          margin: "24px",
          padding: "20px 24px",
          borderRadius: "8px",
          border: "1px solid #da3633",
          background: "rgba(218, 54, 51, 0.08)",
          fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          {/* Warning icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#da3633"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontWeight: "700", fontSize: "14px", color: "#da3633" }}>
            Something went wrong
          </span>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--gh-text, #24292f)", lineHeight: 1.6 }}>
          A component crashed during rendering. The full error has been logged to the{" "}
          <strong>DevTools console</strong> (F12 → Console tab).
        </p>

        {/* Error message */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            background: "rgba(0,0,0,0.06)",
            fontSize: "12px",
            color: "#da3633",
            marginBottom: "12px",
            wordBreak: "break-word",
          }}
        >
          <strong>Error:</strong> {error?.message || String(error)}
        </div>

        {/* Toggle stack trace */}
        <button
          onClick={() => this.setState({ expanded: !expanded })}
          style={{
            background: "none",
            border: "1px solid rgba(218,54,51,0.4)",
            borderRadius: "4px",
            color: "#da3633",
            fontSize: "11px",
            padding: "4px 10px",
            cursor: "pointer",
            marginBottom: expanded ? "10px" : "0",
          }}
        >
          {expanded ? "Hide" : "Show"} component stack
        </button>

        {expanded && info?.componentStack && (
          <pre
            style={{
              margin: "0",
              padding: "12px",
              borderRadius: "6px",
              background: "rgba(0,0,0,0.08)",
              fontSize: "11px",
              color: "var(--gh-muted, #656d76)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {info.componentStack}
          </pre>
        )}

        <div style={{ marginTop: "16px" }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              background: "rgba(218,54,51,0.12)",
              border: "1px solid rgba(218,54,51,0.4)",
              color: "#da3633",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
              marginRight: "8px",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              background: "transparent",
              border: "1px solid var(--gh-border, #d0d7de)",
              color: "var(--gh-text, #24292f)",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
}
