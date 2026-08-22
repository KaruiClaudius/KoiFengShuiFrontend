import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import usericon from "../../assets/icons/userIcon.png";
import { Link, useNavigate, useParams } from "react-router-dom";
import TruncatedText from "../../utils/TruncatedText";
import "../HomePage/Homepage.css";
import {
  Row,
  Col,
  Card,
  Button,
  Image,
  Typography,
  Avatar,
  Descriptions,
  Space,
  message,
} from "antd";
import api, { getFengShuiKoiDetail } from "../../config/axios";
import { PhoneOutlined } from "@ant-design/icons";
const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0]?.image?.imageUrl);

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Image
          src={mainImage}
          alt="Main Property Image"
          style={{
            width: "40vw",
            height: "40vh",
            maxHeight: "100vh",
            maxWidth: "100vw",
          }}
        />
      </Col>
      <Col span={24}>
        <Row
          gutter={[8, 8]}
          style={{ overflowX: "auto", whiteSpace: "nowrap" }}
        >
          {images.map((image, index) => (
            <Col key={index} style={{ display: "inline-block" }}>
              <Image
                src={image.image.imageUrl}
                alt={`Property Image`}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => setMainImage(image.image.imageUrl)}
                preview={false}
              />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
};

const DecorationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [koiDetails, setDataDecoration] = React.useState(null);
  const [decorId, setDecorId] = React.useState(null);

  const [error, setError] = React.useState(null); // Handle errors
  const { Title, Text } = Typography;
  const scrollContainerRef1 = useRef(null);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [cardDataKoiBaseOnAccount, setCardDataKoiBaseOnAccount] =
    React.useState([]); // Store data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const renderDecoration = (data) => {
    return data.map((item) => (
      <div key={item.listingId} className="card-container">
        <div className="property-card">
          {item.tierName == "Preminum" && (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          )}

          <img
            src={item.listingImages?.[0]?.image?.imageUrl}
            alt="Card"
            className="property-image"
          />
          <div className="property-content">
            <a
              href={`/Decoration/${item.listingId}`}
              className="property-title-link"
              style={{ width: "70%" }}
            >
              <div className="property-title-wrapper">
                <h1 className="property-title">
                  <TruncatedText text={item.title} maxLength={10} />
                </h1>
              </div>
            </a>
            <div className="property-user-container">
              <img
                src={
                  item.accountName
                    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                        item.accountName
                      )}`
                    : usericon
                }
                alt="Banner"
                className="property-user-icon"
              />{" "}
              {/* Replace icon as needed */}
              <span className="property-user-text" style={{ margin: "auto" }}>
                {item.accountName}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await getFengShuiKoiDetail(id);
        if (cancelled) return;
        const detail = response.data[0];
        setDataDecoration(detail);

        if (detail) {
          const responseKoiBaseOnAccount = await api
            .get(
              `/api/MarketplaceListings/GetAllByAccount/${detail.accountId}/Category/2?excludeListingId=${id}&page=1&pageSize=10`
            )
            .then((response) => response.data);
          if (cancelled) return;
          setCardDataKoiBaseOnAccount(responseKoiBaseOnAccount.data);
        }
      } catch (error) {
        if (!cancelled) setError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    setIsLoggedIn(!!localStorage.getItem("token"));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) return <div>Error: {error}</div>;
  if (!koiDetails) return <div>No property details found</div>;

  // Function to scroll left by a specific amount
  const scrollLeft = (containerRef) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -300, // Adjust the scroll distance as needed
        behavior: "smooth", // Smooth scroll
      });
    }
  };

  // Function to scroll right by a specific amount
  const scrollRight = (containerRef) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 300, // Adjust the scroll distance as needed
        behavior: "smooth", // Smooth scroll
      });
    }
  };
  const scrollLeft1 = () => scrollLeft(scrollContainerRef1);
  const scrollRight1 = () => scrollRight(scrollContainerRef1);
  const handleButtonClick = () => {
    if (isLoggedIn) {
      setShowPhoneNumber(!showPhoneNumber);
    } else {
      message.error("Đăng nhập để thấy số điện thoại người đăng");
      //navigate("/auth");
    }
  };

  return (
    <div
      style={{
        minHeight: "150vh",
        height: "100%",
        background: "#f6f4f3",
      }}
      className="detail-page-container"
    >
      <AppHeader />
      <div style={{ padding: "70px 100px 0 100px", overflow: "auto" }}>
        {/* Breadcrumb */}
        <Row>
          <Col span={20}>
            <Text style={{ display: "flex", marginTop: 10 }}>
              <Link
                underline="none"
                to={`/`}
                style={{
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Trang chủ
              </Link>
              <div style={{ padding: "0 3px" }}>&gt;</div>
              <Link
                underline="none"
                to={`/KoiListings?category=2`}
                style={{
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Đồ Trang trí
              </Link>
              <div style={{ padding: "0 3px" }}>&gt;</div>
              <div style={{ color: "orange", fontWeight: "bold" }}>
                {koiDetails.title}
              </div>
            </Text>
          </Col>
        </Row>
        <div className="detail-page-detail">
          {/* Main Property Section */}
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            {/* Image Gallery */}
            <Col xs={24} lg={14}>
              <Typography
                style={{
                  fontWeight: "bold",
                  fontSize: "30px",
                  marginBottom: "20px",
                }}
              >
                {koiDetails.elementName && `[${koiDetails.elementName}] `}{" "}
                {koiDetails.title}
              </Typography>
              <ImageGallery images={koiDetails.listingImages} />
            </Col>
            {/* Owner Information */}
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
                  {/* Owner Details */}
                  <Col span={24}>
                    <Space
                      direction="vertical"
                      align="center"
                      style={{ width: "100%" }}
                    >
                      <Avatar
                        size={64}
                        src={
                          koiDetails.accountName
                            ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                                koiDetails.accountName
                              )}`
                            : usericon
                        }
                      />
                      <Title level={5}>{koiDetails.accountName}</Title>
                    </Space>
                  </Col>

                  {/* Additional Information */}
                  <Col span={24}>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Số lượng">
                        {koiDetails.quantity}
                      </Descriptions.Item>
                      <Descriptions.Item label="Màu sắc">
                        {koiDetails.color}
                      </Descriptions.Item>
                      {koiDetails.elementName && (
                        <Descriptions.Item label="Bản mệnh">
                          {koiDetails.elementName}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Col>

                  {/* Communication Options */}
                  <Col span={24}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Button
                        icon={<PhoneOutlined />}
                        size="large"
                        style={{ width: "100%" }}
                        onClick={handleButtonClick}
                      >
                        {showPhoneNumber && isLoggedIn
                          ? koiDetails.accountPhoneNumber
                          : "Gọi ngay bây giờ"}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Property Details Section */}
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
              <Typography style={{ fontWeight: "bold", fontSize: "25px" }}>
                Mô tả
              </Typography>
              <Text>{koiDetails.description}</Text>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 20, paddingBottom: 50 }}>
          <Col xs={24} lg={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button onClick={scrollLeft1} className="arrow-button">
                ←
              </button>
              <div className="white-box" style={{ width: "100%" }}>
                <div
                  className="container-title"
                  style={{ justifyContent: "space-between" }}
                >
                  <h2>Đồ Trang Trí Liên Quan</h2>
                  <a
                    href={`/`}
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    <h2>Xem thêm {">"}</h2>
                  </a>
                </div>
                <div
                  style={{
                    display: "flex",
                    overflow: "hidden",
                    width: "100%",
                  }}
                  ref={scrollContainerRef1}
                  className="scroll-container"
                >
                  {renderDecoration(cardDataKoiBaseOnAccount)}
                </div>
              </div>
              <button onClick={scrollRight1} className="arrow-button">
                →
              </button>
            </div>
          </Col>
        </Row>
      </div>
      <FooterComponent />
    </div>
  );
};
export default DecorationPage;
