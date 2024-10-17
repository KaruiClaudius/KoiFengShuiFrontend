import React, { useRef, useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import des from "../../assets/deconration.png";
import usericon from "../../assets/icons/userIcon.png";
import "./Homepage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { CardContent } from "@mui/material";
import { Typography } from "antd";
import TruncatedText from "../../utils/TruncatedText";
import api, {
  getFengShuiKoiFishPost,
  getFengShuiKoiDecorationPost,
  getFengShuiKoiPost,
} from "../../config/axios";
export default function Homepage() {
  const navigate = useNavigate();
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data
  const [cardDataDecoration, setCardDataDecoration] = React.useState([]); // Store data
  const [cardDataPost, setCardDataPost] = React.useState([]); // Store data
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [error, setError] = React.useState(null); // Handle errors

  const scrollContainerRef1 = useRef(null); // Reference to the scrollable container
  const scrollContainerRef2 = useRef(null);
  const scrollContainerRef3 = useRef(null);
  const scrollContainerRef4 = useRef(null);

  const sellingFishClick = () => {
    navigate("/sellingFish");
  };

  const fishProductClick = () => {
    navigate("/fishProduct");
  };

  const koiCompatible = () => {
    navigate("/KoiCompatible");
  };

  const blogClick = () => {
    navigate("/blog");
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const responseKoi = await getFengShuiKoiFishPost(); // Adjust endpoint
        const responseDecoration = await getFengShuiKoiDecorationPost();
        const responsePost = await getFengShuiKoiPost();
        setCardDataKoi(responseKoi.data); // Store the data
        setCardDataDecoration(responseDecoration.data);
        setCardDataPost(responsePost.data);
      } catch (error) {
        setError(error.message); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };
    // Fetch data from API when the component mounts
    fetchData();
  }, []);
  const formatVietnameseCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
  const scrollLeft3 = () => scrollLeft(scrollContainerRef3);
  const scrollRight3 = () => scrollRight(scrollContainerRef3);

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
              href={`/KoiDetail/${item.listingId}`}
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
              <h2 className="property-price-text">Giá tiền:</h2>
              <span className="property-price-text" style={{ color: "red" }}>
                {formatVietnameseCurrency(item.price)}
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

  const renderDecoration = (data) => {
    return data.map((item) => (
      <div className="card-container">
        <div className="property-card">
          {item.tierName == "Preminum" ? (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          ) : (
            <h1> </h1>
          )}

          <img src={des} alt="Card" className="property-image" />
          <div className="property-content">
            <a
              href={`/KoiDetail/${item.listingId}`}
              className="property-title-link"
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
            <div className="property-price-container">
              <h2 className="property-price-text">Giá tiền:</h2>{" "}
              {/* Replace icon as needed */}
              <span className="property-price-text" style={{ color: "red" }}>
                {formatVietnameseCurrency(item.price)}
              </span>
            </div>
            <div className="property-user-container">
              <img src={usericon} alt="Banner" className="property-user-icon" />{" "}
              {/* Replace icon as needed */}
              <span className="property-user-text">{item.accountName}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };
  if (loading) return <p>Loading...</p>; // Display loading message
  if (error) return <p>Error: {error}</p>;
  return (
    <div
      style={{
        minHeight: "150vh",
        background: "#f6f4f3",
      }}
      className="homepage-container"
    >
      <AppHeader />
      <div className="image-container">
        <img src={image} alt="Banner" className="half-page-image" />

        <div className="centered-text">
          <div className="title-banner">
            <h1 style={{ color: "#e20a15" }}>Koi</h1>
            <h1 style={{ color: "#ff914d" }}>FengShui</h1>
          </div>
          <p style={{ color: "white", fontWeight: "bold" }}>
            Cân Bằng Phong Thủy, Koi Vượng Tài Lộc
          </p>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="search-bar"
            />
            <button className="search-icon-button">
              <img
                src={searchIcon}
                alt="Search"
                className="search-icon"
                style={{ width: "20px" }}
              />
            </button>
          </div>
          <div className="button-group">
            <button className="custom-button" onClick={sellingFishClick}>
              Bán Cá Koi
            </button>
            <button className="custom-button" onClick={fishProductClick}>
              Phụ Kiện Hồ Cá
            </button>
            <button className="custom-button" onClick={blogClick}>
              Kinh Nghiệm Hay
            </button>
            <button className="custom-button" onClick={koiCompatible}>
              Tư Vấn Bản Mệnh
            </button>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="content-wrapper">
          <div className="render-koi-elemet">
            <button onClick={scrollLeft1} className="arrow-button">
              ←
            </button>
            <div class="white-box">
              <div className="container-title">
                <h2 className="container-title-title">Cá Koi Theo Bản Mệnh</h2>
                <a href={`/fishProduct`} className="container-title-link">
                  <h2>Xem thêm {">"}</h2>
                </a>
              </div>

              <div
                style={{ display: "flex", overflowX: "scroll" }}
                ref={scrollContainerRef1}
                className="scroll-container"
              >
                {/* Render Koi items here */}
                {renderKoi(cardDataKoi)}
              </div>
            </div>
            <button onClick={scrollRight1} className="arrow-button">
              →
            </button>
          </div>
          <div
            className="render-koi-elemet"
            style={{ display: "flex", alignItems: "center" }}
          >
            <button onClick={scrollLeft2} className="arrow-button">
              ←
            </button>
            <div class="white-box">
              <div className="container-title">
                <h2 className="container-title-title">Bán Cá Koi</h2>
                <a href={`/fishProduct`} className="container-title-link">
                  <h2>Xem thêm {">"}</h2>
                </a>
              </div>
              <div
                style={{ display: "flex", overflowX: "scroll" }}
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
          <div
            className="render-koi-elemet"
            style={{ display: "flex", alignItems: "center" }}
          >
            <button onClick={scrollLeft3} className="arrow-button">
              ←
            </button>
            <div class="white-box">
              <div className="container-title">
                <h2 className="container-title-title">Phụ kiện hồ cá</h2>
                <a href={`/fishProduct`} className="container-title-link">
                  <h2>Xem thêm {">"}</h2>
                </a>
              </div>
              <div
                style={{ display: "flex", overflowX: "scroll" }}
                ref={scrollContainerRef3}
                className="scroll-container"
              >
                {renderDecoration(cardDataDecoration)}
              </div>
            </div>
            <button onClick={scrollRight3} className="arrow-button">
              →
            </button>
          </div>
          <div class="white-box">
            <div className="container-title">
              <h2 className="container-title-title">Kinh Nghiệm Hay</h2>
              <a href={`/blog`} className="container-title-link">
                <h2>Xem thêm {">"}</h2>
              </a>
            </div>
            <div style={{ display: "flex" }}></div>
          </div>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
}
