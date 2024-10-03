import React, { useState } from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import "./Homepage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { CardContent } from "@mui/material";
import { Typography } from "antd";
export default function HomePage() {
  const navigate = useNavigate();

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

  const renderCards = () => {
    return (
      <div className="property-card">
        <img src={image} alt="Card" className="property-image" />
        <div className="property-content">
          <a href={`/property`} className="property-title-link">
            <h2 className="property-title">[Mệnh]Tiêu đề</h2>
          </a>
          <div className="property-price-container">
            <span className="property-price-icon">💰</span>{" "}
            {/* Replace icon as needed */}
            <span className="property-price-text">Giá tiền</span>
          </div>
          <div className="property-price-container"></div>
          <span className="property-price-text">Icon:</span>{" "}
          {/* Replace icon as needed */}
          <span className="property-price-text">Nguyễn Minh Quang</span>
        </div>
      </div>
    );
  };
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
      <div>
        {renderCards()}
        {renderCards()}
      </div>
      <FooterComponent />
    </div>
  );
}
