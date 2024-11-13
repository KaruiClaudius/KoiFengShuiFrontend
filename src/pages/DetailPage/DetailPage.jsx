import React, { useCallback, useEffect, useRef, useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import usericon from "../../assets/icons/userIcon.png";
import "./DetailPage.css";
import TruncatedText from "../../utils/TruncatedText";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardContent } from "@mui/material";
const type = JSON.parse(localStorage.getItem("type"));
import {
  Row,
  Col,
  Card,
  Button,
  List,
  Divider,
  Image,
  Typography,
  Avatar,
  Descriptions,
  Space,
  Layout,
  message,
} from "antd";
import api, {
  getFengShuiKoiDetail,
  getFengShuiKoiFishPost,
} from "../../config/axios";
import {
  PhoneOutlined,
  StarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { ImOffice } from "react-icons/im";

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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getFengShuiKoiDetail(id);
      setDataKoi(response.data[0]); // Access the first item in the data array
      const responseMarketCategory = await api
        .get("/api/MarketCategory/GetAll")
        .then((response) => response.data);
      setCategory(responseMarketCategory.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchKoiData = useCallback(
    async (
      koiElement = koiDetails.elementId,
      koiAccount = koiDetails.accountId,
      page = 1,
      pageSize = 10,
      categoryId = koiDetails.categoryId
    ) => {
      try {
        const responseKoi = await api
          .get(
            `/api/MarketplaceListings/GetAllByElementId/${koiElement}/Category/${categoryId}?excludeListingId=${id}&page=${page}&pageSize=${pageSize}`
          )
          .then((response) => response.data);
        const responseKoiBaseOnAccount = await api
          .get(
            `/api/MarketplaceListings/GetAllByAccount/${koiAccount}/Category/${categoryId}?excludeListingId=${id}&page=${page}&pageSize=${pageSize}`
          )
          .then((response) => response.data);

        setCardDataKoi(responseKoi.data);
        setCardDataKoiBaseOnAccount(responseKoiBaseOnAccount.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    }
  );
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

            <div className="property-price-container">
              <span className="property-price-text">Giá tiền: </span>
              <span
                className="property-price-text"
                style={{ color: "red", marginLeft: "4px" }}
              >
                {formatCurrency(item.price)}VNĐ
              </span>
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

  React.useEffect(() => {
    fetchData();
    fetchKoiData();
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [fetchData, fetchKoiData]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
  if (loading) return <div>Loading...</div>;
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
                      <Descriptions.Item label="Giá tiền">
                        {formatCurrency(koiDetails.price)} đ
                      </Descriptions.Item>
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
                    __html: koiDetails.description,
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
                      <div class="white-box" style={{ width: "100%" }}>
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

                    <div class="white-box" style={{ width: "100%" }}>
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
