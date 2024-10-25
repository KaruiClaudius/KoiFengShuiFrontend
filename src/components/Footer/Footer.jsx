import React from "react";
import { Layout, Row, Col } from "antd";
import Logo from "../../assets/Logo.png";
const { Footer } = Layout;

const FooterComponent = () => {
  return (
    <Footer
      className="ant-layout-footer"
      style={{
        backgroundColor: "#2c1b18",
        color: "#d3b58d",
        padding: "20px 50px",
        textAlign: "left",
        position: "relative",
      }}
    >
      <Row justify="space-between" align="top">
        <Col xs={24} md={4}>
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "100px", marginBottom: "10px", height: 100 }}
          />
        </Col>

        <Col xs={24} md={8}>
          <h3 style={{ color: "#d3b58d" }}>Về chúng tôi</h3>
          <p>
            Koi Feng Shui - Cân Bằng Phong Thủy, Koi Vượng Tài Lộc!
            <br />
            Koi Feng Shui là điểm đến lý tưởng cho những người yêu thích cá Koi
            và nghệ thuật tạo cảnh hồ cá. Chúng tôi tự hào cung cấp:
            <ul>
              <li>Cá Koi chất lượng cao từ các trại giống uy tín</li>
              <li>Đa dạng sản phẩm trang trí và thiết bị cho hồ cá Koi</li>
              <li>
                Tư vấn chuyên sâu về cá Koi thông qua các bài blog chia sẻ kinh
                nghiệm
              </li>
            </ul>
          </p>
        </Col>

        <Col xs={24} md={8}>
          <h3 style={{ color: "#d3b58d" }}>Thông tin liên hệ</h3>
          <p>
            + Hotline 24/7: xxxx.xxxx.xxxx
            <br />+ Email: koifengshui@gmail.com
          </p>
          <p>Thiết kế & duy trì bởi Koi Feng Shui | koifengshui.com.vn</p>
        </Col>
      </Row>
      <div
        style={{
          backgroundColor: "#e63946",
          color: "#fff",
          textAlign: "center",
          padding: "5px 0",
          marginTop: "20px",
          width: "100%",
        }}
      >
        @ Copy right 2024
      </div>
    </Footer>
  );
};

export default FooterComponent;
