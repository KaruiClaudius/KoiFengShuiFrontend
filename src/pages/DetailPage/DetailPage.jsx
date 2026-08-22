import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import usericon from "../../assets/icons/userIcon.png";
import "./DetailPage.css";
import TruncatedText from "../../utils/TruncatedText";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
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
import api, {
  getFengShuiKoiDetail,
} from "../../config/axios";
import { PhoneOutlined } from "@ant-design/icons";

const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0]?.image?.imageUrl || "");
  return (
    <Row gutter={[16, 16]} style={{ height: "100%" }}>
      {/* Left column for sub-images */}
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

      {/* Right column for main image */}
      <Col xs={24} sm={16} md={18} lg={19}>
        <Image
          src={mainImage}
          alt="Main Property Image"
          style={{
            height: "68vh",
            objectFit: "contain",
            border: "4px solid black", // Add border here
            borderRadius: "8px", // Optional: add border radius for rounded corners
          }}
        />
      </Col>
    </Row>
  );
};
const DetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [koiDetails, setDataKoi] = React.useState(null);
  const [error, setError] = React.useState(null); // Handle errors
  const { Title, Text } = Typography;
  const scrollContainerRef1 = useRef(null);
  const scrollContainerRef2 = useRef(null);
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data
  const [categoryData, setCategory] = useState([]);
  const [cardDataKoiBaseOnAccount, setCardDataKoiBaseOnAccount] =
    React.useState([]); // Store data
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await getFengShuiKoiDetail(id);
        if (cancelled) return;
        const detail = response.data[0];
        setDataKoi(detail);

        const responseMarketCategory = await api
          .get("/api/MarketCategory/GetAll")
          .then((response) => response.data);
        if (cancelled) return;
        setCategory(responseMarketCategory.data);

        if (detail) {
          const [responseKoi, responseKoiBaseOnAccount] = await Promise.all([
            api
              .get(
                `/api/MarketplaceListings/GetAllByElementId/${detail.elementId}/Category/${detail.categoryId}?excludeListingId=${id}&page=1&pageSize=10`
              )
              .then((response) => response.data),
            api
              .get(
                `/api/MarketplaceListings/GetAllByAccount/${detail.accountId}/Category/${detail.categoryId}?excludeListingId=${id}&page=1&pageSize=10`
              )
              .then((response) => response.data),
          ]);
          if (cancelled) return;
          setCardDataKoi(responseKoi.data);
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
  const renderKoi = (data) => {
    return data.map((item) => (
      <div className="card-container" key={item.listingId}>
        <div className="property-card">
          {item.tierName === "Tin Nổi Bật" && (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          )}

          <Link
            to={`/Details/${item.listingId}`}
            style={{ justifyContent: "center" }}
          >
            <img
              src={item.listingImages?.[0]?.image?.imageUrl}
              alt={item.title}
              className="property-koi-image"
              // onError={(e) => {
              //   e.target.src = ;
              // }}
            />
          </Link>

          <div className="property-content">
            <div className="property-title-wrapper">
              <h1 className="property-title">
                <a
                  href={`/Details/${item.listingId}`}
                  className="property-title-link"
                >
                  {item.elementName != "Non element" && `[${item.elementName}]`}{" "}
                  <TruncatedText text={item.title} maxLength={10} />{" "}
                </a>
              </h1>
            </div>

            <div className="property-user-container">
              <img
                src={
                  item.accountName
                    ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                        item.accountName
                      )}`
                    : usericon
                }
                alt="User Icon"
                className="property-user-icon"
              />
              <span className="property-user-text" style={{ margin: "auto 0" }}>
                {item.accountName}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

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
  const scrollLeft2 = () => scrollLeft(scrollContainerRef2);
  const scrollRight2 = () => scrollRight(scrollContainerRef2);
  const handleButtonClick = () => {
    if (isLoggedIn) {
      setShowPhoneNumber(!showPhoneNumber);
    } else {
      message.error("Đăng nhập để thấy số điện thoại người đăng");
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
                onMouseEnter={(e) => (e.target.style.color = "#ff914d")}
                onMouseLeave={(e) => (e.target.style.color = "black")}
              >
                Trang chủ
              </Link>
              <div style={{ padding: "0 3px" }}>&gt;</div>
              <Link
                underline="none"
                to={`/KoiListings`}
                style={{
                  textDecoration: "none",
                  color: "black",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#ff914d")}
                onMouseLeave={(e) => (e.target.style.color = "black")}
              >
                {
                  categoryData.find(
                    (category) => category.categoryid === koiDetails.categoryId
                  )?.categoryName
                }
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
                {koiDetails.elementName != "Non element" &&
                  `[${koiDetails.elementName}]`}{" "}
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
                        src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                          koiDetails.accountName
                        )}`}
                        alt={koiDetails.accountName}
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
                      <Descriptions.Item label="Bản mệnh">
                        {koiDetails.elementName}
                      </Descriptions.Item>
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
                          : "Gọi ngay"}
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
              <Text>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(koiDetails.description || ""),
                  }}
                ></div>
              </Text>
            </Card>
          </Col>
        </Row>
        {cardDataKoi && cardDataKoi.length > 0 && (
          <Row style={{ marginTop: 20, width: "100%" }}>
            <Col xs={24} lg={24}>
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <div
                  className="render-koi-elemet"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <button onClick={scrollLeft2} className="arrow-button">
                    ←
                  </button>
                  {koiDetails.elementName != "Non element" &&
                    koiDetails.elementName &&
                    cardDataKoi && (
                      <div className="white-box" style={{ width: "100%" }}>
                        <div
                          className="container-title"
                          style={{
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          {categoryData.find(
                            (category) =>
                              category.categoryid === koiDetails.categoryId
                          )?.categoryName && (
                            <h2>
                              {
                                categoryData.find(
                                  (category) =>
                                    category.categoryid ===
                                    koiDetails.categoryId
                                )?.categoryName
                              }{" "}
                              Cùng Bản Mệnh
                            </h2>
                          )}
                          <a
                            href={`/KoiListings?category=1&element=${koiDetails.elementId}`}
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            <h2>Xem thêm {">"}</h2>
                          </a>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            overflow: "hidden",
                          }}
                          ref={scrollContainerRef2}
                          className="scroll-container"
                        >
                          {renderKoi(cardDataKoi)}
                        </div>
                      </div>
                    )}
                  <button onClick={scrollRight2} className="arrow-button">
                    →
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        )}
        <Row style={{ marginTop: 20, width: "100%", paddingBottom: 50 }}>
          <Col xs={24} lg={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {cardDataKoiBaseOnAccount &&
                cardDataKoiBaseOnAccount.length > 0 && (
                  <div
                    className="render-koi-elemet"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <button onClick={scrollLeft1} className="arrow-button">
                      ←
                    </button>

                    <div className="white-box" style={{ width: "100%" }}>
                      <div
                        className="container-title"
                        style={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        {categoryData.find(
                          (category) =>
                            category.categoryid === koiDetails.categoryId
                        )?.categoryName && (
                          <h2>
                            {
                              categoryData.find(
                                (category) =>
                                  category.categoryid === koiDetails.categoryId
                              )?.categoryName
                            }{" "}
                            Liên Quan
                          </h2>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          overflow: "hidden",
                        }}
                        ref={scrollContainerRef1}
                        className="scroll-container"
                      >
                        {renderKoi(cardDataKoiBaseOnAccount)}
                      </div>
                    </div>

                      <button onClick={scrollRight1} className="arrow-button">
                        →
                      </button>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
          <FooterComponent />
        </div>
      );
    };
export default DetailPage;
