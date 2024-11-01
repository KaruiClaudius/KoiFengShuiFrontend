import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import image from "../../assets/banner1.jpg";
import ex from "../../assets/koio_ex.png";
import des from "../../assets/deconration.png";
import usericon from "../../assets/icons/userIcon.png";
import "./Homepage.css";
import searchIcon from "../../assets/icons/searchIcon.svg";
import { Link, useNavigate } from "react-router-dom";
import { getAllPosts } from "../../config/axios";
// import { CardContent } from "@mui/material";
// import { Typography } from "antd";
import TruncatedText from "../../utils/TruncatedText";
import {
  getFengShuiKoiFishPost,
  getFengShuiKoiDecorationPost,
  getFengShuiKoiPost,
  getKoiElement,
} from "../../config/axios";
import FAQDisplay from "../FAQ/FAQDisplay";
export default function Homepage() {
  const navigate = useNavigate();
  const [cardDataKoi, setCardDataKoi] = React.useState([]); // Store data
  const [cardDataKoiElement, setCardDataKoiElement] = React.useState([]); // Store data
  const [cardDataDecoration, setCardDataDecoration] = React.useState([]); // Store data
  const [existElementData, setExistElementData] = React.useState([]); // Store data
  const [cardDataPost, setCardDataPost] = React.useState([]); // Store data
  const [loading, setLoading] = React.useState(true); // Handle loading state
  const [error, setError] = React.useState(null); // Handle errors
  const [currentIndex, setCurrentIndex] = useState(0); // Carousel index
  const maxPosts = 7; // Maximum number of blog can  display on Kinh Nghiệm Hay
  const [isModalVisible, setIsModalVisible] = useState(false); // Manages the modal's visibility state; starts as false (hidden)
  const [selectedPost, setSelectedPost] = useState(null); // Stores the currently selected post; initially set to null (no post selected)

  const scrollContainerRef1 = useRef(null); // Reference to the scrollable container
  const scrollContainerRef2 = useRef(null);
  const scrollContainerRef3 = useRef(null);
  const scrollContainerRef4 = useRef(null);
  const [elementName, setElementName] = useState("");
  const [elementId, setElementId] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
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

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, Math.min(cardDataPost.length - 4, maxPosts - 4))
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  React.useEffect(() => {
    // const updateUserData = (event) => {
    //   const updatedUser = event.detail;
    //   const elementName = elementMapping[updatedUser.elementId];
    //   setElementName(elementName);
    //   setElementId(updatedUser.elementId);
    // };

    // // Initial data load
    // const token = localStorage.getItem("token");
    // const user = JSON.parse(localStorage.getItem("user"));
    // if (token && user) {
    //   updateUserData({ detail: user });
    // }
    const fetchData = async () => {
      try {
        const responseKoi = await getFengShuiKoiFishPost(); // Adjust endpoint
        const responseDecoration = await getFengShuiKoiDecorationPost();
        const responsePost = await getAllPosts();
        setCardDataKoi(responseKoi.data); // Store the data
        setCardDataDecoration(responseDecoration.data);
        setCardDataPost(responsePost.data);
        setCardDataKoi(responseKoi.data);
        if (user != null) {
          if (user.elementId) {
            const responseKoiElement = await getKoiElement(
              user.elementId,
              1,
              10
            ); // Store the data
            setCardDataKoiElement(responseKoiElement.data);
          }
        } else {
          setCardDataKoiElement(null);
        }
      } catch (error) {
        setError(error.message); // Handle error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    //window.addEventListener("userProfileUpdated", updateUserData);

    // Fetch data from API when the component mounts
    fetchData();
    // if (elementId != null) {
    //   fetchDataElement(elementId);
    // }
    // Cleanup function to remove event listener
    // return () => {
    //   window.removeEventListener("userProfileUpdated", updateUserData);
    // };
  }, []);

  // Add event listener

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
          {item.tierName === "Preminum" && (
            <div className="featured-badge">
              <span>Nổi bật</span>
            </div>
          )}

          <Link
            to={`/KoiDetails/${item.listingId}`}
            style={{ justifyContent: "center" }}
          >
            <img
              src={item.listingImages?.[0]?.image?.imageUrl || defaultImage}
              alt={item.title}
              className="property-koi-image"
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />
          </Link>

          <div className="property-content">
            <div className="property-title-wrapper">
              <h1 className="property-title">
                <a
                  href={`/KoiDetails/${item.listingId}`}
                  className="property-title-link"
                >
                  [{item.elementName}]{" "}
                  <TruncatedText text={item.title} maxLength={20} />{" "}
                </a>
              </h1>
            </div>

            <div className="property-price-container">
              <span className="property-price-text">Giá tiền: </span>
              <span
                className="property-price-price"
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
          <Link
            key={item.homeId}
            to={`/Decoration/${item.listingId}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
            }}
          >
            <img src={des} alt="Card" className="property-image" />
          </Link>
          <div className="property-content">
            <a
              href={`/Decoration/${item.listingId}`}
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
              <span className="property-user-text">{item.accountName}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };
  const renderCardsPost = (data) => {
    const visiblePosts = data.slice(currentIndex, currentIndex + 4); // Extracts a subset of 4 posts
    return visiblePosts.map((item, index) => (
      <div
        className="card-container"
        key={`${item.id}-${index}`}
        onClick={() => showModal(item)}
      >
        <div className="property-card">
          <img src={item.imageUrls[0]} alt="Card" className="property-image" />
          <div className="property-content">
            <a href={`/property`} className="property-title-link"></a>
            <div className="property-price-container">
              <span className="property-price-text-red">{item.name}</span>
              <span className="property-price-text-black">
                {item.description}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };
  const showModal = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
            {/* <input
              type="text"
              placeholder="Tìm kiếm..."
              className="search-bar"
            /> */}
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
          {cardDataKoiElement != null ? (
            <div className="render-koi-elemet">
              <button onClick={scrollLeft1} className="arrow-button">
                ←
              </button>
              <div class="white-box">
                <div className="container-title">
                  <h2 className="container-title-title">
                    Cá Koi Theo Bản Mệnh
                  </h2>
                  <a href={`/fishProduct`} className="container-title-link">
                    <h2>Xem thêm {">"}</h2>
                  </a>
                </div>

                <div
                  style={{
                    display: "flex",
                    overflowX: "scroll",
                    width: "100%",
                  }}
                  ref={scrollContainerRef1}
                  className="scroll-container"
                >
                  {/* Render Koi items here */}
                  {renderKoi(cardDataKoiElement)}
                </div>
              </div>
              <button onClick={scrollRight1} className="arrow-button">
                →
              </button>
            </div>
          ) : null}
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
        <div className="carousel-wrapper">
          <button
            className="carousel-button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            &lt;
          </button>
          <div className="carousel-content">
            {renderCardsPost(cardDataPost.slice(0, maxPosts))}
          </div>
          <button
            className="carousel-button"
            onClick={handleNext}
            disabled={
              currentIndex + 4 >= Math.min(cardDataPost.length, maxPosts)
            }
          >
            &gt;
          </button>
        </div>
      </div>
      <FAQDisplay />
      <FooterComponent />
      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <img
          src={selectedPost?.imageUrls[0]}
          alt="Card"
          style={{ width: "100%" }}
        />
        <h2 style={{ textAlign: "center", marginTop: "10px" }}>
          {selectedPost?.name}
        </h2>
        <p>{selectedPost?.description}</p>
      </Modal>
    </div>
  );
}
