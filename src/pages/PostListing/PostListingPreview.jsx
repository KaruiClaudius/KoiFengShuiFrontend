import React from "react";
import { Row, Col, Card, Typography, Image, Button, Descriptions } from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import usericon from "../../assets/icons/userIcon.png";
const { Title, Text } = Typography;
function formatCurrency(value) {
  // Ensure value is a number
  const numValue = Number(value);

  if (isNaN(numValue)) {
    return "Invalid input";
  }

  if (numValue < 1e6) {
    // Less than a million
    return addThousandSeparators(numValue);
  } else if (numValue >= 1e9) {
    // Billions
    return formatLargeNumber(numValue, 1e9, "tỷ");
  } else {
    // Default case (shouldn't normally be reached)
    return addThousandSeparators(numValue);
  }
}

function formatLargeNumber(value, unitValue, unitName) {
  const wholePart = Math.floor(value / unitValue);
  const fractionalPart = Math.round((value % unitValue) / (unitValue / 10));

  let result = addThousandSeparators(wholePart) + " " + unitName;
  if (fractionalPart > 0) {
    result += " " + addThousandSeparators(fractionalPart);
  }
  return result;
}
function addThousandSeparators(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
// Function to scroll left by a specific amount
const scrollLeft = (containerRef) => {
  if (containerRef.current) {
    containerRef.current.scrollBy({
      left: -300, // Adjust the scroll distance as needed
      behavior: "smooth", // Smooth scroll
    });
  }
};

const PropertyPreview = ({ propertyDetails, onBack }) => {
  return (
    <div
      style={{
        minHeight: "150vh",
        height: "100%",
        background: "#f6f4f3",
      }}
      className="detail-page-container"
    >
      <div style={{ padding: "70px 100px 0 100px", overflow: "auto" }}>
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} lg={14}>
            <Typography
              style={{
                fontWeight: "bold",
                fontSize: "30px",
                marginBottom: "20px",
              }}
            >
              {propertyDetails.elementName != "Non element" &&
                `[${propertyDetails.elementName}]`}{" "}
              {propertyDetails.name}
            </Typography>
            <ImageGallery images={propertyDetails.homeImages} />
          </Col>
          <Col xs={24} lg={10}>
            <Card
              style={{
                top: 0,
                zIndex: 1,
                marginTop: 30,
                border: "2px solid",
                borderRadius: "8px",
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column", // Arrange items in a column
                      justifyContent: "center", // Center items vertically
                      alignItems: "center", // Center items horizontally
                      height: "100%",
                    }}
                  >
                    <img
                      src={
                        propertyDetails.ownerName
                          ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                              propertyDetails.ownerName
                            )}`
                          : usericon
                      }
                      alt="User Icon"
                      style={{ height: "50%", width: "30%" }}
                    />
                    <Title level={5}>{propertyDetails.ownerName}</Title>
                  </div>
                </Col>
                <Col span={24}>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Giá tiền">
                      {formatCurrency(propertyDetails.price)} đ
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng">
                      {propertyDetails.quantity}
                    </Descriptions.Item>
                    <Descriptions.Item label="Màu sắc">
                      {propertyDetails.colors.join(", ")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bản mệnh">
                      {propertyDetails.elementName}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 20, width: "100%" }}>
          <Col xs={24} lg={24}>
            <Card
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Title level={3}>Mô tả</Title>
              <Text>
                <div
                  dangerouslySetInnerHTML={{
                    __html: propertyDetails.description,
                  }}
                ></div>
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = React.useState(
    images[0]?.image?.imageUrl || ""
  );
  return (
    <Row gutter={[16, 16]} style={{ height: "100%" }}>
      <Col xs={24} sm={8} md={6} lg={5}>
        <div
          style={{
            overflowY: "auto",
            maxHeight: "80vh",
          }}
        >
          {images.map((image, index) => (
            <Col key={index} style={{ display: "inline-block" }}>
              <Image
                src={image.image.imageUrl}
                alt={`Property Image ${index + 1}`}
                style={{
                  height: "120px",
                  objectFit: "cover",
                  marginBottom: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setMainImage(image.image.imageUrl)}
                preview={false}
              />
            </Col>
          ))}
        </div>
      </Col>
      <Col xs={24} sm={16} md={18} lg={19}>
        <Image
          src={mainImage}
          alt="Main Property Image"
          style={{
            height: "68vh",
            objectFit: "contain",
            border: "4px solid black",
            borderRadius: "8px",
          }}
        />
      </Col>
    </Row>
  );
};

export default PropertyPreview;
