import React from "react";
import { Form, Input, Button, Select, Card, Row, Col } from "antd";
import "./KoiCompatibility.css"; // Custom styles
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";

const { Option } = Select;

const KoiCompatibilityForm = () => {
  const onFinish = (values) => {
    console.log("Form Values: ", values);
  };

  return (
    <div className="page-container">
      {/* Header Section */}
      <header style={{ marginBottom: "24px" }}>
        <AppHeader />
      </header>

      {/* Main Form Section */}
      <Row gutter={16}>
        <Col span={12}>
          <Button block className="btnElement">
            Tư vấn bản mệnh
          </Button>
        </Col>
        <Col span={12}>
          <Button block className="btnCompa">
            Đánh giá độ phù hợp
          </Button>
        </Col>
      </Row>
      <main className="compatibility-form-container">
        <Card className="compatibility-card" bordered={false}>
          <h2>Đánh giá độ phù hợp</h2>
          <Form
            name="koi_compatibility"
            onFinish={onFinish}
            layout="vertical"
            className="koi-form"
          >
            <Form.Item
              label="Năm sinh"
              name="birthYear"
              rules={[
                {
                  required: true,

                  message: "Vui lòng nhập năm sinh",
                },
                { type: "number", message: "Vui lòng bằng chữ số" },
              ]}
            >
              <Input placeholder="2003" />
            </Form.Item>

            <Form.Item
              label="Màu sắc cá koi"
              name="koiColor"
              rules={[{ required: true, message: "Vui lòng chọn màu cá koi" }]}
            >
              <Select placeholder="Chọn màu cá koi">
                <Option value="Trắng">Trắng</Option>
                <Option value="Đỏ">Đỏ</Option>
                <Option value="Vàng">Vàng</Option>
                <Option value="Đen">Đen</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Số lượng cá Koi"
              name="koiNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng" },
                { type: "number", message: "Vui lòng bằng chữ số" },
              ]}
            >
              <Input placeholder="1" />
            </Form.Item>
            <Form.Item
              label="Hướng đặt hồ"
              name="pondDirection"
              rules={[
                { required: true, message: "Vui lòng chọn hướng đặt hồ" },
              ]}
            >
              <Select placeholder="Chọn hướng đặt hồ">
                <Option value="Đông">Đông</Option>
                <Option value="Tây">Tây</Option>
                <Option value="Nam">Nam</Option>
                <Option value="Bắc">Bắc</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Hình dạng hồ"
              name="pondShape"
              rules={[
                { required: true, message: "Vui lòng chọn hình dạng hồ" },
              ]}
            >
              <Select placeholder="Chọn hình dạng hồ">
                <Option value="Vuông">Vuông</Option>
                <Option value="Tròn">Tròn</Option>
                <Option value="Chữ nhật">Chữ nhật</Option>
                <Option value="Hình bầu dục">Hình bầu dục</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="submit-button"
              >
                Tính toán độ phù hợp
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </main>

      {/* Footer Section */}
      <footer className="site-footer">
        <FooterComponent />
      </footer>
    </div>
  );
};

export default KoiCompatibilityForm;
