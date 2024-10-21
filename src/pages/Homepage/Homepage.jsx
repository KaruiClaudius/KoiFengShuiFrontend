
import React from "react";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import des from "../../assets/deconration.png";
import usericon from "../../assets/icons/userIcon.png";
import "./Homepage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { useNavigate } from "react-router-dom";
// import { CardContent } from "@mui/material";
// import { Typography } from "antd";
import TruncatedText from "../../utils/TruncatedText";
import {
  getFengShuiKoiFishPost,
  getFengShuiKoiDecorationPost,
  getFengShuiKoiPost,
} from "../../config/axios";
import FAQDisplay from "../FAQ/FAQDisplay";
export default function Homepage() {
  const navigate = useNavigate();
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data
  const [cardDataDecoration, setCardDataDecoration] = React.useState([]); // Store data
  const [cardDataPost, setCardDataPost] = React.useState([]); // Store data
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
  const renderCards = (data) => {
    return data.map((item) => (
      <div className="card-container">
        <div className="property-card"> 
          <div className="featured-badge">
            <span>Nổi bật</span>
           
          </div>
          <img src={ex} alt="Card" className="property-image" />
          <div className="property-content">
            <a href={`/property`} className="property-title-link">
              {/* {item.element && item.element.length > 0 ? ( */}
              <h1 className="property-title">
                [{item.elementName}] <TruncatedText text={item.name} />
              </h1>
              {/* ) : (
                <h1 className="property-title">{item.name}</h1>
              )} */}
            </a>
            <div className="property-price-container">
              <h2 className="property-price-text">Giá tiền:</h2>{" "}
              {/* Replace icon as needed */}
              <span className="property-price-text" style={{ color: "red" }}>
                {item.price}.000đ
              </span>
            </div>
            <div className="property-price-container">
              <img
                src={usericon}
                alt="Banner"
                className="property-price-icon"
              />{" "}
              {/* Replace icon as needed */}
              <span className="property-price-text">{item.accountName}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };
  const renderCardsDeconration = (data) => {
    return data.map((item) => (
      <div className="card-container">
        <div className="property-card">
          <div className="featured-badge">
            <span>Nổi bật</span>
          </div>
          <img src={des} alt="Card" className="property-image" />
          <div className="property-content">
            <a href={`/property`} className="property-title-link">
              {/* {item.element && item.element.length > 0 ? ( */}
              <h1 className="property-title">
                [{item.elementName}] <TruncatedText text={item.name} />
              </h1>
              {/* ) : (
                <h1 className="property-title">{item.name}</h1>
              )} */}
            </a>
            <div className="property-price-container">
              <h2 className="property-price-text">Giá tiền:</h2>{" "}
              {/* Replace icon as needed */}
              <span className="property-price-text" style={{ color: "red" }}>
                {item.price}.000đ
              </span>
            </div>
            <div className="property-price-container">
              <img
                src={usericon}
                alt="Banner"
                className="property-price-icon"
              />{" "}
              {/* Replace icon as needed */}
              <span className="property-price-text">{item.accountName}</span>
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
      <div className="white-box">
        <div className="container-title">
          <h2 className="container-title-title">Cá Koi Theo Bản Mệnh</h2>
          <a href={`/fishProduct`} className="container-title-link">
            <h2>Xem thêm {">"}</h2>
          </a>
        </div>
        <div style={{ display: "flex" }}>{renderCards(cardDataKoi)}</div>
      </div>
      <div className="white-box">
        <div className="container-title">
          <h2 className="container-title-title">Bán Cá Koi</h2>
          <a href={`/fishProduct`} className="container-title-link">
            <h2>Xem thêm {">"}</h2>
          </a>
        </div>
        <div style={{ display: "flex" }}>{renderCards(cardDataKoi)}</div>
      </div>
      <div className="white-box">
        <div className="container-title">
          <h2 className="container-title-title">Phụ kiện hồ cá</h2>
          <a href={`/fishProduct`} className="container-title-link">
            <h2>Xem thêm {">"}</h2>
          </a>
        </div>
        <div style={{ display: "flex" }}>
          {renderCardsDeconration(cardDataDecoration)}
        </div>
      </div>
      <div className="white-box">
        <div className="container-title">
          <h2 className="container-title-title">Kinh Nghiệm Hay</h2>
          <a href={`/blog`} className="container-title-link">
            <h2>Xem thêm {">"}</h2>
          </a>
        </div>
        <div style={{ display: "flex" }}>{renderCards(cardDataPost)}</div>
      </div>
      <FAQDisplay />
      <FooterComponent />
    </div>
  );
}
