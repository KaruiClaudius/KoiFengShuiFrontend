import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error("Unhandled UI error:", error.message);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: "#f6f4f3",
            fontFamily: "system-ui, sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0 }}>Đã xảy ra lỗi</h1>
          <p style={{ color: "#555", maxWidth: "480px" }}>
            Trang gặp sự cố không mong muốn. Vui lòng thử tải lại.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#a92c2c",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Về trang chủ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
