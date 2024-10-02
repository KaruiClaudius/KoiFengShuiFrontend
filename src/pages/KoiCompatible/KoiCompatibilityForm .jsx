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
  Descriptions,
  message,
  Layout,
} from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import {
  assessCompatibility,
  getFengShuiConsultation,
} from "../../config/axios";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const KoiCompatibilityForm = () => {
  const [formType, setFormType] = useState("compatibility");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let response;
      if (formType === "compatibility") {
        response = await assessCompatibility({
          dateOfBirth: parseInt(values.birthYear),
          direction: values.pondDirection,
          pondShape: values.pondShape,
          fishColor: values.koiColor,
          fishQuantity: parseInt(values.koiNumber),
        });
      } else {
        response = await getFengShuiConsultation({
          yearOfBirth: parseInt(values.birthYear),
        });
      }
      setResults(response.data);
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const renderCompatibilityForm = () => (
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
          {[
            "Đông",
            "Tây",
            "Nam",
            "Bắc",
            "Đông Nam",
            "Tây Nam",
            "Đông Bắc",
            "Tây Bắc",
            "Trung tâm",
          ].map((direction) => (
            <Option key={direction} value={direction}>
              {direction}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Hình dạng hồ"
        name="pondShape"
        rules={[{ required: true, message: "Vui lòng chọn hình dạng hồ" }]}
      >
        <Select placeholder="Chọn hình dạng hồ">
          {["Vuông", "Tròn", "Chữ nhật", "Hình bầu dục"].map((shape) => (
            <Option key={shape} value={shape}>
              {shape}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="submit-button"
        >
          Tính toán độ phù hợp
        </Button>
      </Form.Item>
    </Form>
  );

  const renderElementForm = () => (
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
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="submit-button"
        >
          Tính toán bản mệnh
        </Button>
      </Form.Item>
    </Form>
  );

  const renderCompatibilityResults = () => (
    <div style={{ textAlign: "center" }}>
      <Title level={3}>Kết quả đánh giá độ phù hợp</Title>
      <Text style={{ fontSize: "24px" }}>
        Điểm số phù hợp của bạn là:{" "}
        <strong>{results.overallCompatibilityScore.toFixed(2)}%</strong>
      </Text>

      {results.overallCompatibilityScore < 100 && (
        <div style={{ marginTop: "20px" }}>
          <Text style={{ fontSize: "20px", color: "#f5222d" }}>
            Đề xuất cải thiện:
          </Text>
          <div style={{ fontSize: "16px", textAlign: "left" }}>
            {results.recommendations.map((recommendation, index) => (
              <Paragraph key={index}>• {recommendation}</Paragraph>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderElementResults = () => (
    <div>
      <Title level={3} style={{ textAlign: "center" }}>
        Kết quả tư vấn bản mệnh
      </Title>
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: "bold", fontSize: "16px" }}
        contentStyle={{ fontSize: "16px" }}
      >
        <Descriptions.Item label="Ngũ hành">
          {results.element}
        </Descriptions.Item>
        <Descriptions.Item label="Con số may mắn">
          {results.luckyNumbers.join(", ")}
        </Descriptions.Item>
        <Descriptions.Item label="Giống cá phù hợp">
          {results.fishBreeds.join(", ")}
        </Descriptions.Item>
        <Descriptions.Item label="Màu cá phù hợp">
          {results.fishColors.join(", ")}
        </Descriptions.Item>
        <Descriptions.Item label="Hình dạng hồ phù hợp">
          {results.suggestedPonds.join(", ")}
        </Descriptions.Item>
        <Descriptions.Item label="Hướng hồ phù hợp">
          {results.suggestedDirections.join(", ")}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card
        bordered={false}
        style={{
          margin: "20px 0",
          padding: "20px",
          background: "#f6f9ff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <Row justify="center" align="middle">
          <Col span={24}>
            {formType === "compatibility"
              ? renderCompatibilityResults()
              : renderElementResults()}
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <Layout
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <AppHeader />
      <Content style={{ flex: 1, padding: "0 50px", marginTop: 64 }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 0" }}
        >
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

          <Card className="compatibility-card" bordered={false}>
            <Title level={2}>
              {formType === "compatibility"
                ? "Đánh giá độ phù hợp"
                : "Tư vấn bản mệnh"}
            </Title>
            {formType === "compatibility"
              ? renderCompatibilityForm()
              : renderElementForm()}
            {renderResults()}
          </Card>
        </div>
      </Content>
      <FooterComponent />
    </Layout>
  );
};

export default KoiCompatibilityForm;
