import React, { useCallback, useEffect, useRef, useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import usericon from "../../assets/icons/userIcon.png";
import "./KoiDetailPage.css";
import TruncatedText from "../../utils/TruncatedText";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardContent } from "@mui/material";
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

const ImageGallery = ({ images }) => {
  //const [mainImage, setMainImage] = useState(images[0]?.image?.imageUrl || "");

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
          {/* {images.map((image, index) => ( */}
          <Image
            // key={index}
            src={ex}
            //alt={`Property Image ${index + 1}`}
            style={{
              height: "120px",
              objectFit: "cover",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => setMainImage(ex)}
            preview={false}
          />
          {/* ))} */}
        </div>
      </Col>

      {/* Right column for main image */}
      <Col xs={24} sm={16} md={18} lg={19}>
        <Image
          src={ex}
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
const KoiDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [koiDetails, setDataKoi] = React.useState(null);
  const [error, setError] = React.useState(null); // Handle errors
  const { Title, Text } = Typography;
  const scrollContainerRef1 = useRef(null);
  const scrollContainerRef2 = useRef(null);
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data
  const [cardDataKoiBaseOnAccount, setCardDataKoiBaseOnAccount] =
    React.useState([]); // Store data
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  const fetchData = async () => {
    try {
      const response = await getFengShuiKoiDetail(id);
      setDataKoi(response.data[0]); // Access the first item in the data array
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
      categoryId = 1
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
          {item.tierName === "Preminum" ? (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          ) : (
            <h1> </h1>
          )}

          <img src={ex} alt="Card" className="property-image" />
          <div className="property-content">
            <a
              href={`/KoiDetails/${item.listingId}`}
              className="property-title-link"
            >
              <div className="property-title-wrapper">
                <h1 className="property-title">
                  [{item.elementName}]{" "}
                  <TruncatedText text={item.title} maxLength={20} />
                </h1>
              </div>
            </a>
            <div className="property-price-container">
              <h2 className="property-price-text" style={{ marginRight: 5 }}>
                Giá tiền:
              </h2>
              <span className="property-price-text" style={{ color: "red" }}>
                {formatCurrency(item.price)}VNĐ
              </span>
            </div>
            <div className="property-user-container">
              <img
                src={usericon}
                alt="User Icon"
                className="property-user-icon"
              />
              <span className="property-user-text">{item.accountName}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderKoiBseOnAccount = (data) => {
    return data.map((item) => (
      <div className="card-container" key={item.listingId}>
        <div className="property-card">
          {item.tierName === "Preminum" ? (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          ) : (
            <h1> </h1>
          )}

          <img src={ex} alt="Card" className="property-image" />
          <div className="property-content">
            <a
              href={`/KoiDetails/${item.listingId}`}
              className="property-title-link"
            >
              <div className="property-title-wrapper">
                <h1 className="property-title">
                  [{item.elementName}]{" "}
                  <TruncatedText text={item.title} maxLength={20} />
                </h1>
              </div>
            </a>
            <div className="property-price-container">
              <h2 className="property-price-text" style={{ marginRight: 5 }}>
                Giá tiền:
              </h2>
              <span className="property-price-text" style={{ color: "red" }}>
                {formatCurrency(item.price)}VNĐ
              </span>
            </div>
            <div className="property-user-container">
              <img
                src={usericon}
                alt="User Icon"
                className="property-user-icon"
              />
              <span className="property-user-text">{item.accountName}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  React.useEffect(() => {
    fetchData();
    fetchKoiData();
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
      return numValue.toLocaleString("vi-VN");
    } else if (numValue >= 1e6 && numValue < 1e9) {
      // Millions
      return formatLargeNumber(numValue, 1e6, "triệu");
    } else if (numValue >= 1e9) {
      // Billions
      return formatLargeNumber(numValue, 1e9, "tỷ");
    } else {
      // Default case (shouldn't normally be reached)
      return numValue.toLocaleString("vi-VN");
    }
  }

  function formatLargeNumber(value, unitValue, unitName) {
    const wholePart = Math.floor(value / unitValue);
    const fractionalPart = Math.round((value % unitValue) / (unitValue / 10));

    let result = wholePart.toLocaleString("vi-VN") + " " + unitName;
    if (fractionalPart > 0) {
      result += " " + fractionalPart.toLocaleString("vi-VN");
    }
    return result;
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
    setShowPhoneNumber(!showPhoneNumber);
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
                to={`/listing`}
                style={{
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Cá Koi
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
                [{koiDetails.elementName}] {koiDetails.title}
              </Typography>
              <ImageGallery images={ex} />
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
                      <Avatar size={64} src={ex} />
                      <Title level={5}>{koiDetails.accountName}</Title>
                    </Space>
                  </Col>

                  {/* Additional Information */}
                  <Col span={24}>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Giá tiền">
                        {formatCurrency(koiDetails.price)} VNĐ
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
                        {showPhoneNumber
                          ? koiDetails.accountPhoneNumber
                          : "Call Now"}
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
        <Row style={{ marginTop: 20, width: "100%" }}>
          <Col xs={24} lg={24}>
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <button onClick={scrollLeft2} className="arrow-button">
                ←
              </button>
              <div class="white-box" style={{ width: "100%" }}>
                <div
                  className="container-title"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <h2>Cá Koi Cùng Bản Mệnh</h2>
                  <a
                    href={`/fishProduct`}
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    <h2>Xem thêm {">"}</h2>
                  </a>
                </div>
                <div
                  style={{
                    display: "flex",
                    overflow: "hidden",
                    width: "50%",
                  }}
                  ref={scrollContainerRef2}
                  className="scroll-container"
                >
                  {renderKoi(cardDataKoi)}
                </div>
              </div>
              <button onClick={scrollRight2} className="arrow-button">
                →
              </button>
            </div>
          </Col>
        </Row>
        <Row style={{ marginTop: 20, width: "100%", paddingBottom: 50 }}>
          <Col xs={24} lg={24}>
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <button onClick={scrollLeft1} className="arrow-button">
                ←
              </button>
              <div class="white-box" style={{ width: "100%" }}>
                <div
                  className="container-title"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <h2>Cá Koi Liên Quan</h2>
                  <a
                    href={`/fishProduct`}
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    <h2>Xem thêm {">"}</h2>
                  </a>
                </div>
                <div
                  style={{
                    display: "flex",
                    overflow: "hidden",
                    width: "50%",
                  }}
                  ref={scrollContainerRef1}
                  className="scroll-container"
                >
                  {renderKoiBseOnAccount(cardDataKoiBaseOnAccount)}
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
export default KoiDetailPage;
