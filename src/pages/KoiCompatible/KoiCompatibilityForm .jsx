import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Alert,
} from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";

const { Option } = Select;
const { Title, Text } = Typography;

const KoiCompatibilityForm = () => {
  const [formType, setFormType] = useState("compatibility");
  const [results, setResults] = useState(null);

  const onFinish = (values) => {
    console.log("Form Values: ", values);
    if (formType === "compatibility") {
      // Mock compatibility calculation
      setResults({
        score: Math.floor(Math.random() * 100),
      });
    } else {
      // Mock element calculation
      const elements = ["Metal", "Wood", "Water", "Fire", "Earth"];
      const colors = ["Red", "Blue", "Green", "Yellow", "White"];
      const fishBreeds = ["Kohaku", "Showa", "Sanke", "Asagi", "Shusui"];
      const pondShapes = ["Square", "Round", "Rectangle", "Oval"];
      const pondDirections = [
        "North",
        "South",
        "East",
        "West",
        "Northeast",
        "Northwest",
        "Southeast",
        "Southwest",
      ];

      setResults({
        element: elements[Math.floor(Math.random() * elements.length)],
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        fitColor: colors[Math.floor(Math.random() * colors.length)],
        fishBreed: fishBreeds[Math.floor(Math.random() * fishBreeds.length)],
        fishColor: colors[Math.floor(Math.random() * colors.length)],
        pondShape: pondShapes[Math.floor(Math.random() * pondShapes.length)],
        pondDirection:
          pondDirections[Math.floor(Math.random() * pondDirections.length)],
      });
    }
  };

  const renderForm = () => {
    if (formType === "compatibility") {
      return (
        <Form
          name="koi_compatibility"
          onFinish={onFinish}
          layout="vertical"
          className="koi-form"
        >
          <Form.Item
            label="Năm sinh"
            name="birthYear"
            rules={[{ required: true, message: "Vui lòng nhập năm sinh" }]}
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
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <Input placeholder="1" />
          </Form.Item>
          <Form.Item
            label="Hướng đặt hồ"
            name="pondDirection"
            rules={[{ required: true, message: "Vui lòng chọn hướng đặt hồ" }]}
          >
            <Select placeholder="Chọn hướng đặt hồ">
              <Option value="Đông">Đông</Option>
              <Option value="Tây">Tây</Option>
              <Option value="Nam">Nam</Option>
              <Option value="Bắc">Bắc</Option>
              <Option value="Đông Nam">Đông Nam</Option>
              <Option value="Tây Nam">Tây Nam</Option>
              <Option value="Đông Bắc">Đông Bắc</Option>
              <Option value="Tây Bắc">Tây Bắc</Option>
              <Option value="Trung tâm">Trung tâm</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Hình dạng hồ"
            name="pondShape"
            rules={[{ required: true, message: "Vui lòng chọn hình dạng hồ" }]}
          >
            <Select placeholder="Chọn hình dạng hồ">
              <Option value="Vuông">Vuông</Option>
              <Option value="Tròn">Tròn</Option>
              <Option value="Chữ nhật">Chữ nhật</Option>
              <Option value="Hình bầu dục">Hình bầu dục</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-button">
              Tính toán độ phù hợp
            </Button>
          </Form.Item>
        </Form>
      );
    } else {
      return (
        <Form
          name="element_advice"
          onFinish={onFinish}
          layout="vertical"
          className="koi-form"
        >
          <Form.Item
            label="Năm sinh"
            name="birthYear"
            rules={[{ required: true, message: "Vui lòng nhập năm sinh" }]}
          >
            <Input placeholder="2003" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-button">
              Tính toán bản mệnh
            </Button>
          </Form.Item>
        </Form>
      );
    }
  };

  const renderResults = () => {
    if (!results) return null;

    if (formType === "compatibility") {
      return (
        <Alert
          message="Kết quả đánh giá độ phù hợp"
          description={`Điểm số phù hợp của bạn là: ${results.score}/100`}
          type="info"
          showIcon
        />
      );
    } else {
      return (
        <Alert
          message="Kết quả tư vấn bản mệnh"
          description={
            <div>
              <Text>Ngũ hành: {results.element}</Text>
              <br />
              <Text>Con số may mắn: {results.luckyNumber}</Text>
              <br />
              <Text>Màu sắc phù hợp: {results.fitColor}</Text>
              <br />
              <Text>Giống cá phù hợp: {results.fishBreed}</Text>
              <br />
              <Text>Màu cá phù hợp: {results.fishColor}</Text>
              <br />
              <Text>Hình dạng hồ phù hợp: {results.pondShape}</Text>
              <br />
              <Text>Hướng hồ phù hợp: {results.pondDirection}</Text>
            </div>
          }
          type="info"
          showIcon
        />
      );
    }
  };

  return (
    <div className="page-container">
      <header style={{ marginBottom: "24px" }}>
        <AppHeader />
      </header>

      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Button
            block
            className={
              formType === "element" ? "btnElement active" : "btnElement"
            }
            onClick={() => setFormType("element")}
          >
            Tư vấn bản mệnh
          </Button>
        </Col>
        <Col span={12}>
          <Button
            block
            className={
              formType === "compatibility" ? "btnCompa active" : "btnCompa"
            }
            onClick={() => setFormType("compatibility")}
          >
            Đánh giá độ phù hợp
          </Button>
        </Col>
      </Row>

      <main className="compatibility-form-container">
        <Card className="compatibility-card" bordered={false}>
          <Title level={2}>
            {formType === "compatibility"
              ? "Đánh giá độ phù hợp"
              : "Tư vấn bản mệnh"}
          </Title>
          {renderForm()}
          {renderResults()}
        </Card>
      </main>

      <footer className="site-footer">
        <FooterComponent />
      </footer>
    </div>
  );
};

export default KoiCompatibilityForm;
