import React, { useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import usericon from "../../assets/icons/userIcon.png";
import "./Homepage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { CardContent } from "@mui/material";
import { Typography } from "antd";
import api, { getFengShuiKoiFishPost } from "../../config/axios";
export default function Homepage() {
  const navigate = useNavigate();
  const [cardData, setCardData] = React.useState([]); // Store data
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [error, setError] = React.useState(null); // Handle errors
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
        const response = await getFengShuiKoiFishPost(); // Adjust endpoint
        setCardData(response.data); // Store the data
      } catch (error) {
        setError(error.message); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };
    // Fetch data from API when the component mounts
    fetchData();
  }, []);
  const renderCards = (data) => {
    return data.map((item) => (
      <div className="card-container">
        <div className="property-card">
          <img src={ex} alt="Card" className="property-image" />
          <div className="property-content">
            <a href={`/property`} className="property-title-link">
              {/* {item.element && item.element.length > 0 ? ( */}
              <h1 className="property-title">
                [{item.elementName}]{item.name}
              </h1>
              {/* ) : (
                <h1 className="property-title">{item.name}</h1>
              )} */}
            </a>
            <div className="property-price-container">
              <h2 className="property-price-text">Giá tiền:</h2>{" "}
              {/* Replace icon as needed */}
              <div className="property-price-text">{item.price}</div>
            </div>
            <div className="property-price-container">
              <img
                src={usericon}
                alt="Banner"
                className="property-price-icon"
              />{" "}
              {/* Replace icon as needed */}
              <span className="property-price-text">{item.createBy}</span>
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
        background: "white",
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
      <div class="white-box">
        <div className="container-title">
          <h2 style={{ margin: "auto" }}>Cá koi theo bản mệnh</h2>
          <h2>Xem thêm {">"}</h2>
        </div>
        <div style={{ display: "flex" }}>{renderCards(cardData)}</div>
      </div>
      <FooterComponent />
    </div>
  );
}
