// FooterComponent.jsx
import React from "react";
import { Layout, Row, Col, Button } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  FacebookOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
// import "./FooterComponent.css"; // We'll use this for custom styling.

const { Footer } = Layout;

const FooterComponent = () => {
  return (
    <Footer
      className="footer"
      style={{
        width: "95%",
      }}
    >
      <Row justify="space-between" align="middle">
        <Col xs={24} md={6} className="footer-logo-qrcode">
          <img
            src="https://picsum.photos/200"
            alt="Logo"
            className="logo"
            style={{ marginRight: "10px" }}
          />
          <img
            src="https://picsum.photos/200"
            alt="QR Code"
            className="qrcode"
          />
        </Col>

        <Col xs={24} md={4}>
          <h3>HƯỚNG DẪN</h3>
          <ul className="footer-links">
            <li>
              <a href="/about-us" target="_blank" rel="noopener noreferrer">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a
                href="/pricing-support"
                target="_blank"
                rel="noopener noreferrer"
              >
                Báo giá & hỗ trợ
              </a>
            </li>
            <li>
              <a href="/faq" target="_blank" rel="noopener noreferrer">
                Câu hỏi thường gặp
              </a>
            </li>
            <li>
              <a href="/report-bugs" target="_blank" rel="noopener noreferrer">
                Góp ý báo lỗi
              </a>
            </li>
          </ul>
        </Col>

        <Col xs={24} md={6}>
          <h3>QUY ĐỊNH</h3>
          <ul className="footer-links">
            <li>
              <a
                href="/posting-rules"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quy định đăng tin
              </a>
            </li>
            <li>
              <a
                href="/terms-agreement"
                target="_blank"
                rel="noopener noreferrer"
              >
                Điều khoản thỏa thuận
              </a>
            </li>
            <li>
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a
                href="/complaint-resolution"
                target="_blank"
                rel="noopener noreferrer"
              >
                Giải quyết khiếu nại
              </a>
            </li>
          </ul>
        </Col>

        <Col
          xs={24}
          md={6}
          className="footer-contact"
          style={{ fontSize: "18px", fontWeight: "bold" }}
        >
          <h4>Chăm sóc khách hàng</h4>
          <MailOutlined style={{ fontSize: "24px", marginRight: "10px" }} />
          <span>trogiup@uninest.com.vn</span>
          <br />
          <h4>Hotline</h4>
          <PhoneOutlined
            style={{ fontSize: "24px", marginRight: "10px", marginTop: "10px" }}
          />
          <span>1900 1886</span>
        </Col>

        <Col xs={24} md={6} className="footer-contact">
          <h3>CHỨNG NHẬN</h3>
          <img
            src="https://pos.nvncdn.com/b47809-47548/art/artCT/20190711_9MTXY8s2VKUAvSRYYKpweJkb.jpg"
            alt="Chứng nhận"
            style={{ marginLeft: "0px", width: "150px" }} // Adjust the image width as necessary
          />
        </Col>
        <Col xs={24} md={6} className="footer-social">
          <h3>LIÊN KẾT</h3>

          <Button
            type="link"
            shape="circle"
            icon={<FacebookOutlined style={{ fontSize: "24px" }} />}
            href="https://www.facebook.com"
            target="_blank"
            style={{ marginRight: "10px" }}
          />

          <Button
            type="link"
            shape="circle"
            icon={<GoogleOutlined style={{ fontSize: "24px" }} />}
            href="https://www.google.com"
            target="_blank"
            style={{ marginRight: "10px" }}
          />

          <Button
            type="link"
            shape="circle"
            href="https://zalo.me"
            target="_blank"
            style={{
              padding: 0,
              width: "34px",
              height: "34px",
              borderRadius: "50%",
            }} // adjust size as needed
          >
            <img
              src="https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Zalo-Arc.png"
              alt="Zalo"
              style={{ width: "24px" }}
            />
          </Button>
        </Col>
      </Row>
    </Footer>
  );
};

export default FooterComponent;
