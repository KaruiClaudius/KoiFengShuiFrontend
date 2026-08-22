import { Link } from "react-router-dom";

const NotFound = () => {
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
      <div style={{ fontSize: "72px", fontWeight: 700, color: "#a92c2c" }}>
        404
      </div>
      <h1 style={{ margin: 0 }}>Không tìm thấy trang</h1>
      <p style={{ color: "#555" }}>
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        to="/"
        style={{
          padding: "10px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          background: "#231815",
          color: "#fff",
          fontSize: "15px",
        }}
      >
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFound;
