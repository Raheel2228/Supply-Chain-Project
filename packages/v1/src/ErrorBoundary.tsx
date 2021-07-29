import React from "react";
import { IProps, Callout, Button } from "@blueprintjs/core";
import * as Sentry from "@sentry/browser";
import config from "./config";

function errorMessage(error: Error | null): string {
  switch (error?.name) {
    case "ChunkLoadError":
      return `${config.appName} has been updated. Please reload the page to use the newest version.`;
    default:
      return "Something went wrong. We’ve been notified and will fix the problem as soon as we can.";
  }
}

interface IErrorBoundaryState {
  error: Error | null;
  errorInfo: object | null;
  eventId: string | null;
}

export default class ErrorBoundary extends React.Component<
  IProps,
  IErrorBoundaryState
> {
  constructor(props: IProps) {
    super(props);
    this.state = { error: null, errorInfo: null, eventId: null };
  }

  componentDidCatch(error: Error | null, errorInfo: object) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo as Record<string, any>);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <Callout
          title={errorMessage(this.state.error)}
          intent="danger"
          style={{ maxWidth: "60em", margin: "auto", borderRadius: "4px" }}
        >
          {process.env.NODE_ENV === "production" && (
            <Button
              onClick={() =>
                Sentry.showReportDialog({
                  eventId: this.state.eventId || undefined,
                })
              }
            >
              Send feedback
            </Button>
          )}

          <Button onClick={() => window.location.reload()}>
            Reload the page
          </Button>
          <br />
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {(this.state.errorInfo as any).componentStack}
          </details>
        </Callout>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}
