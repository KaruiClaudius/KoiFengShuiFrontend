import React, { useCallback, useEffect, useRef, useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import des from "../../assets/deconration.png";
import usericon from "../../assets/icons/userIcon.png";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CardContent } from "@mui/material";
import TruncatedText from "../../utils/TruncatedText";
import "../HomePage/Homepage.css";
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
import api, { getFengShuiKoiDetail } from "../../config/axios";
import {
  PhoneOutlined,
  StarOutlined,
  MessageOutlined,
} from "@ant-design/icons";
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

  const renderDecoration = (data) => {
    return data.map((item) => (
      <div key={item.listingId || index} className="card-container">
        <div className="property-card">
          {item.tierName == "Preminum" ? (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          ) : (
            <h1> </h1>
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
              {/* {item.element && item.element.length > 0 ? ( */}
              <div className="property-title-wrapper">
                <h1 className="property-title">
                  <TruncatedText text={item.title} maxLength={10} />
                </h1>
              </div>
              {/* ) : (
                <h1 className="property-title">{item.name}</h1>
              )} */}
            </a>
            <div
              className="property-price-container"
              style={{ display: "flex" }}
            >
              <h2 className="property-price-text" style={{ marginRight: 5 }}>
                Giá tiền:
              </h2>{" "}
              {/* Replace icon as needed */}
              <span className="property-price-price" style={{ color: "red" }}>
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

  function formatLargeNumber(value, unitValue, unitName) {
    const wholePart = Math.floor(value / unitValue);
    const fractionalPart = Math.round((value % unitValue) / (unitValue / 10));

    let result = wholePart.toLocaleString("vi-VN") + " " + unitName;
    if (fractionalPart > 0) {
      result += " " + fractionalPart.toLocaleString("vi-VN");
    }
    return result;
  }
  const fetchData = async () => {
    try {
      const response = await getFengShuiKoiDetail(id);
      setDataDecoration(response.data[0]); // Access the first item in the data array
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchKoiData = useCallback(
    async (
      koiAccount = koiDetails.accountId,
      page = 1,
      pageSize = 10,
      categoryId = 2
    ) => {
      try {
        const responseKoiBaseOnAccount = await api
          .get(
            `/api/MarketplaceListings/GetAllByAccount/${koiAccount}/Category/${categoryId}?excludeListingId=${id}&page=${page}&pageSize=${pageSize}`
          )
          .then((response) => response.data);

        //setCardDataKoi(responseKoi.data);
        setCardDataKoiBaseOnAccount(responseKoiBaseOnAccount.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    }
  );
  // const updateUserData = (event) => {
  //   const updatedUser = event.detail;
  //   setUserData(updatedUser);
  //   setFullName(updatedUser.fullName);
  //   setUserRole(updatedUser.roleId);
  //   const elementName = updatedUser.elementId
  //     ? elementMapping[updatedUser.elementId]
  //     : "Unknown";
  //   setElementName(elementName);
  //   setAvatarUrl(
  //     `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
  //       updatedUser.fullName
  //     )}`
  //   );
  // };
  React.useEffect(() => {
    fetchData();
    fetchKoiData();

    // // Add event listener
    // window.addEventListener("userProfileUpdated", updateUserData);

    // Initial data load
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    // if (token && user) {
    //   updateUserData({ detail: user });
    // }
    setIsLoggedIn(!!token);
    // // Cleanup function to remove event listener
    // return () => {
    //   window.removeEventListener("userProfileUpdated", updateUserData);
    // };
  }, [fetchData, fetchKoiData]);
  if (loading) {
    return <div>Loading...</div>;
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
                to={`/listing`}
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
                      <Descriptions.Item label="Giá tiền">
                        {formatCurrency(koiDetails.price)} VNĐ
                      </Descriptions.Item>
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
              <div class="white-box" style={{ width: "100%" }}>
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
