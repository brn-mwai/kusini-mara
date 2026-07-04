import { Component, type ReactNode } from "react";

type ErrorBoundaryState = { error: Error | null };

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--t-spacing-3)",
            height: "100%",
            color: "var(--t-font-color-tertiary)",
            fontFamily: "var(--t-font-family)",
          }}
        >
          <span>Something went wrong.</span>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            style={{
              padding: "var(--t-spacing-1) var(--t-spacing-3)",
              background: "var(--t-background-secondary)",
              border: "1px solid var(--t-border-color-medium)",
              borderRadius: "var(--t-border-radius-sm)",
              color: "var(--t-font-color-primary)",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
